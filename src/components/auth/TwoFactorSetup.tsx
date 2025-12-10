import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield, QrCode, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import kslogo from '@/assets/kslogo.png';

const twoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

type TwoFactorForm = z.infer<typeof twoFactorSchema>;

export default function TwoFactorSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [mfaData, setMfaData] = useState<{ qr_code: string; secret: string } | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(true);
  const { enrollMFA, verifyMFA } = useAuth();
  const navigate = useNavigate();

  const form = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    const enroll = async () => {
      setIsLoading(true);
      const { error, data } = await enrollMFA();
      setIsLoading(false);

      if (error) {
        toast.error('Failed to setup 2FA');
        navigate('/settings');
      } else if (data) {
        setMfaData(data);
      }
    };

    enroll();
  }, [enrollMFA, navigate]);

  const handleSubmit = async (data: TwoFactorForm) => {
    setIsLoading(true);
    // Note: In production, you'd get the challengeId from the MFA challenge flow
    const { error } = await verifyMFA(mfaData?.secret || '', 'challenge-id', data.code);
    setIsLoading(false);

    if (!error) {
      toast.success('2FA enabled successfully!');
      navigate('/settings');
    }
  };

  if (isLoading && isEnrolling) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10" />

      <Card className="w-full max-w-md relative z-10 glass-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <Link to="/" className="flex justify-center">
            <img src={kslogo} alt="KSFoundation" className="h-16 w-auto" />
          </Link>
          <CardTitle className="text-2xl font-bold">
            Setup Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app and enter the 6-digit code.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {mfaData && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QrCode className="h-32 w-32" />
                {/* In a real app, you'd render the actual QR code here */}
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  QR Code would be rendered here
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Or enter this code manually:
                </p>
                <code className="text-xs bg-muted p-2 rounded font-mono">
                  {mfaData.secret}
                </code>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                {...form.register('code')}
              />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full btn-rocket" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Enable 2FA
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/settings')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 inline mr-1" />
            2FA adds an extra layer of security to your account
          </div>
        </CardContent>
      </Card>
    </div>
  );
}