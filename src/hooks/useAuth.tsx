import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trackNewSession, cleanupOldSessions } from '@/services/sessionService';
import { sendWelcomeEmail, sendVerificationEmail } from '@/services/emailService';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  subscription_plan: 'free' | 'starter' | 'business' | 'enterprise';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  mfaChallenge: { challengeId: string; factorId: string } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: 'google' | 'apple' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  enrollMFA: () => Promise<{ error: Error | null; data?: { factorId: string; qr_code: string; secret: string } }>;
  verifyMFA: (factorId: string, code: string) => Promise<{ error: Error | null }>;
  verifyMFAChallenge: (challengeId: string, factorId: string, code: string) => Promise<{ error: Error | null }>;
  unenrollMFA: (factorId: string) => Promise<{ error: Error | null }>;
  listSessions: () => Promise<{ error: Error | null; data?: any[] }>;
  revokeSession: (sessionId: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeId: string; factorId: string } | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }
    return data as Profile;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    // Track new session
    if (data.user) {
      try {
        await trackNewSession(data.user.id, navigator.userAgent);
      } catch (sessionError) {
        console.warn('Failed to track session:', sessionError);
        // Don't fail login if session tracking fails
      }
    }
    
    toast.success('Welcome back!');
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
      return { error };
    }
    
    // Track new session
    if (data.user) {
      try {
        await trackNewSession(data.user.id, navigator.userAgent);
      } catch (sessionError) {
        console.warn('Failed to track session:', sessionError);
      }
      
      // Send welcome email
      try {
        await sendWelcomeEmail(email, fullName || 'User');
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
      }
    }
    
    toast.success('Account created successfully! Check your email to verify.');
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    toast.success('Signed out successfully');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      return { error };
    }

    await refreshProfile();
    toast.success('Profile updated!');
    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'apple' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Password reset email sent!');
    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Password updated successfully!');
    return { error: null };
  };

  const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    return {
      error: null,
      data: {
        factorId: data.id,
        qr_code: data.totp.qr_code,
        secret: data.totp.secret
      }
    };
  };

  const verifyMFA = async (factorId: string, code: string) => {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      code
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('2FA verified successfully!');
    return { error: null };
  };

  const unenrollMFA = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('2FA disabled successfully!');
    return { error: null };
  };

  const listSessions = async () => {
    // Note: This is a placeholder - Supabase doesn't have admin session management in client SDK
    // This would need to be implemented via server-side API
    toast.error('Session management not implemented');
    return { error: new Error('Not implemented'), data: [] };
  };

  const revokeSession = async (sessionId: string) => {
    // Note: This is a placeholder - Supabase doesn't have admin session management in client SDK
    // This would need to be implemented via server-side API
    toast.error('Session revocation not implemented');
    return { error: new Error('Not implemented') };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signInWithProvider,
      signOut,
      updateProfile,
      refreshProfile,
      resetPassword,
      updatePassword,
      enrollMFA,
      verifyMFA,
      unenrollMFA,
      listSessions,
      revokeSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
