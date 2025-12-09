import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailPreferences {
  id: string;
  user_id: string;
  marketing_emails: boolean;
  transactional_emails: boolean;
  invoice_emails: boolean;
  ticket_updates: boolean;
  security_alerts: boolean;
  newsletter: boolean;
}

export default function EmailPreferencesComponent() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('email_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as any);

      if (error && error.code !== 'PGRST116') {
        console.warn('Email preferences error:', error);
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if they don't exist
        const { data: newPrefs } = await (supabase
          .from('email_preferences' as any)
          .insert({
            user_id: user.id,
            marketing_emails: true,
            transactional_emails: true,
            invoice_emails: true,
            ticket_updates: true,
            security_alerts: true,
            newsletter: true,
          })
          .select()
          .single() as any);

        if (newPrefs) {
          setPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences || !user) return;
    setIsSaving(true);

    try {
      const { error } = await (supabase
        .from('email_preferences' as any)
        .update({
          marketing_emails: preferences.marketing_emails,
          transactional_emails: preferences.transactional_emails,
          invoice_emails: preferences.invoice_emails,
          ticket_updates: preferences.ticket_updates,
          security_alerts: preferences.security_alerts,
          newsletter: preferences.newsletter,
        })
        .eq('user_id', user.id) as any);

      if (error) throw error;
      toast.success('Email preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof EmailPreferences) => {
    if (preferences && key !== 'id' && key !== 'user_id') {
      setPreferences({
        ...preferences,
        [key]: !preferences[key],
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Failed to load email preferences</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Choose which emails you'd like to receive from KSFoundation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Essential Emails */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Essential</h3>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium cursor-pointer">
                Transactional Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Password resets, account confirmations, and important account changes
              </p>
            </div>
            <Switch
              checked={preferences.transactional_emails}
              onCheckedChange={() => handleToggle('transactional_emails')}
              disabled
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium cursor-pointer">
                Security Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Login attempts, 2FA setup, and security notifications
              </p>
            </div>
            <Switch
              checked={preferences.security_alerts}
              onCheckedChange={() => handleToggle('security_alerts')}
              disabled
            />
          </div>
        </div>

        {/* Billing & Invoices */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Billing</h3>
          
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium cursor-pointer">
                Invoice Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Monthly invoices and payment confirmations
              </p>
            </div>
            <Switch
              checked={preferences.invoice_emails}
              onCheckedChange={() => handleToggle('invoice_emails')}
            />
          </div>
        </div>

        {/* Support & Updates */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Support & Updates</h3>
          
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium cursor-pointer">
                Ticket Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Responses to your support tickets
              </p>
            </div>
            <Switch
              checked={preferences.ticket_updates}
              onCheckedChange={() => handleToggle('ticket_updates')}
            />
          </div>
        </div>

        {/* Marketing & Newsletter */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Marketing & Communication</h3>
          
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium cursor-pointer">
                Newsletter
              </Label>
              <p className="text-sm text-muted-foreground">
                Industry tips, feature announcements, and company news
              </p>
            </div>
            <Switch
              checked={preferences.newsletter}
              onCheckedChange={() => handleToggle('newsletter')}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium cursor-pointer">
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Promotions, offers, and product updates
              </p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={() => handleToggle('marketing_emails')}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
