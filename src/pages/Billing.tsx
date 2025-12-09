import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Check,
  Zap,
  Server,
  Shield,
  Globe,
  Headphones,
  CreditCard,
  Receipt,
  ArrowRight,
  Crown,
  Rocket,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '1 Hosting Account',
      '1GB Storage',
      '10GB Bandwidth',
      'Free SSL Certificate',
      'Email Support',
    ],
    icon: Rocket,
    popular: false,
  },
  {
    name: 'Starter',
    price: 4.99,
    description: 'Best for personal projects',
    features: [
      '3 Hosting Accounts',
      '25GB Storage',
      '100GB Bandwidth',
      'Free SSL & CDN',
      '1 Free Domain',
      'Daily Backups',
      'Priority Support',
    ],
    icon: Zap,
    popular: false,
  },
  {
    name: 'Business',
    price: 9.99,
    description: 'For growing businesses',
    features: [
      'Unlimited Hosting Accounts',
      '100GB SSD Storage',
      'Unlimited Bandwidth',
      'Free SSL & CDN',
      '3 Free Domains',
      'Daily Backups',
      'Priority Support',
      'Staging Environment',
      'Advanced Analytics',
    ],
    icon: Crown,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 29.99,
    description: 'For large scale operations',
    features: [
      'Everything in Business',
      '500GB NVMe Storage',
      'Dedicated Resources',
      'Custom Domains',
      'White Label',
      'API Access',
      '24/7 Phone Support',
      'SLA Guarantee',
      'Custom Integrations',
    ],
    icon: Shield,
    popular: false,
  },
];

const invoices = [
  { id: 'INV-001', date: '2024-12-01', amount: 9.99, status: 'Paid' },
  { id: 'INV-002', date: '2024-11-01', amount: 9.99, status: 'Paid' },
  { id: 'INV-003', date: '2024-10-01', amount: 9.99, status: 'Paid' },
];

export default function Billing() {
  const { profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = profile?.subscription_plan || 'free';

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    toast.info(`To upgrade to ${planName}, please contact our sales team or use the checkout button.`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and view billing history
          </p>
        </div>

        {/* Current Plan */}
        <Card className="gradient-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-bold capitalize">{currentPlan}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-medium">January 1, 2025</p>
                </div>
                <Button variant="outline" asChild>
                  <a href="#plans">
                    Upgrade <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div id="plans">
          <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''
                } ${currentPlan === plan.name.toLowerCase() ? 'ring-2 ring-success' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                {currentPlan === plan.name.toLowerCase() && (
                  <Badge className="absolute -top-3 right-4 bg-success">
                    Current
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-full bg-muted w-fit mb-2">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? 'btn-rocket' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={currentPlan === plan.name.toLowerCase()}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {currentPlan === plan.name.toLowerCase()
                      ? 'Current Plan'
                      : plan.price === 0
                      ? 'Get Started'
                      : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded bg-background">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">No payment method</p>
                  <p className="text-sm text-muted-foreground">Add a card to upgrade your plan</p>
                </div>
              </div>
              <Button variant="outline">Add Card</Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No invoices yet
              </p>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">${invoice.amount}</span>
                      <Badge variant="outline" className="text-success border-success">
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
