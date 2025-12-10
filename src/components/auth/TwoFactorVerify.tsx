import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import kslogo from '@/assets/kslogo.png';

const twoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

type TwoFactorForm = z.infer<typeof twoFactorSchema>;

export default function TwoFactorVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const { verifyMFA } = useAuth();
  const navigate = useNavigate();

  const form = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: '' },
  });

  const handleSubmit = async (data: TwoFactorForm) => {
    setIsLoading(true);
    // In a real implementation, you'd get the factorId and challengeId from the MFA challenge
    const factorId = 'factor-id-from-challenge';
    const challengeId = 'challenge-id-from-challenge';
    const { error } = await verifyMFA(factorId, challengeId, data.code);
    setIsLoading(false);

    if (!error) {
      toast.success('2FA verified successfully!');
      navigate('/dashboard');
    }
  };

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
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>

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
              Verify Code
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Don't have access to your authenticator?</p>
            <Button variant="link" className="p-0 h-auto text-sm">
              Use backup codes instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}