import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  Zap, 
  Shield, 
  Globe,
  Rocket,
  Server,
  Clock,
  Headphones,
  ArrowRight,
  Star,
  Lock,
  RefreshCw,
  Database
} from 'lucide-react';

const plans = [
  {
    name: 'WordPress Starter',
    icon: <Globe className="h-6 w-6" />,
    monthlyPrice: 3.99,
    yearlyPrice: 2.49,
    description: 'Perfect for personal blogs',
    features: [
      '1 WordPress Website',
      '50GB SSD Storage',
      'Free SSL Certificate',
      'Auto WordPress Updates',
      'Weekly Backups',
      '24/7 Support'
    ],
    color: 'from-success to-emerald-400'
  },
  {
    name: 'WordPress Business',
    icon: <Rocket className="h-6 w-6" />,
    monthlyPrice: 6.99,
    yearlyPrice: 3.99,
    description: 'For growing businesses',
    popular: true,
    features: [
      'Up to 100 WordPress Sites',
      '200GB NVMe Storage',
      'Free SSL + CDN',
      'Staging Environment',
      'Daily Backups',
      'Priority Support',
      'Free Domain',
      'WP-CLI Access'
    ],
    color: 'from-primary to-orange-400'
  },
  {
    name: 'WordPress Pro',
    icon: <Server className="h-6 w-6" />,
    monthlyPrice: 12.99,
    yearlyPrice: 7.99,
    description: 'High-traffic WordPress sites',
    features: [
      'Unlimited WordPress Sites',
      '300GB NVMe Storage',
      'Free SSL + CDN + DNS',
      'Object Caching (Redis)',
      'Real-time Backups',
      'Dedicated Resources',
      'White-label Hosting',
      'Advanced Security'
    ],
    color: 'from-secondary to-blue-400'
  }
];

const features = [
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'LiteSpeed Cache',
    description: 'Up to 10x faster WordPress with built-in caching technology'
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'WordPress Security',
    description: 'Malware scanning, firewall, and automatic security patches'
  },
  {
    icon: <RefreshCw className="h-8 w-8" />,
    title: 'Auto Updates',
    description: 'Automatic WordPress core, plugin, and theme updates'
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: 'Daily Backups',
    description: 'Automated daily backups with one-click restore'
  },
  {
    icon: <Database className="h-8 w-8" />,
    title: 'Staging Environment',
    description: 'Test changes safely before going live'
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: 'WordPress Experts',
    description: '24/7 support from WordPress specialists'
  }
];

const WordPressHosting = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--muted))_0%,transparent_70%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Optimized for WordPress</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                WordPress Hosting
                <span className="block gradient-text-orange">Built for Speed</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Lightning-fast WordPress hosting with LiteSpeed cache, automatic updates, and expert 24/7 support. Start your WordPress site today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button variant="rocket" size="lg" className="gap-2 text-lg px-8">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8">
                  Compare Plans
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-success" />
                  <span>Free SSL Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-success" />
                  <span>30-Day Money Back</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span>4.8/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Choose Your WordPress Plan
              </h2>
              <p className="text-muted-foreground mb-8">
                All plans include free migration, SSL, and WordPress optimization
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 p-1.5 bg-muted rounded-full">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <span className="px-2 py-0.5 bg-success text-success-foreground text-xs rounded-full">
                    Save 40%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`relative bg-card/80 backdrop-blur-xl border-border/50 p-8 ${
                    plan.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                    {plan.icon}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-foreground">
                      ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <Button variant={plan.popular ? 'rocket' : 'outline'} className="w-full mb-6">
                    Get Started
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3 text-sm">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                WordPress-Optimized Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for a fast, secure, and reliable WordPress website
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-xl border-border/50 p-6">
                  <div className="inline-flex p-3 rounded-xl bg-primary/20 text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to Launch Your WordPress Site?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of WordPress users who trust KSFoundation for their hosting needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="rocket" size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Talk to Sales
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WordPressHosting;
