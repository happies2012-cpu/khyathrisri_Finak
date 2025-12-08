import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  Cloud,
  Zap, 
  Shield, 
  Globe,
  Rocket,
  Server,
  ArrowRight,
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  Scale,
  Lock
} from 'lucide-react';

const plans = [
  {
    name: 'Cloud Startup',
    cpu: '2 vCPU',
    ram: '4GB RAM',
    storage: '80GB NVMe',
    bandwidth: '4TB Transfer',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    color: 'from-success to-emerald-400'
  },
  {
    name: 'Cloud Professional',
    cpu: '4 vCPU',
    ram: '8GB RAM',
    storage: '160GB NVMe',
    bandwidth: '8TB Transfer',
    monthlyPrice: 19.99,
    yearlyPrice: 14.99,
    popular: true,
    color: 'from-primary to-orange-400'
  },
  {
    name: 'Cloud Enterprise',
    cpu: '8 vCPU',
    ram: '16GB RAM',
    storage: '320GB NVMe',
    bandwidth: 'Unlimited',
    monthlyPrice: 39.99,
    yearlyPrice: 29.99,
    color: 'from-secondary to-blue-400'
  },
  {
    name: 'Cloud Ultimate',
    cpu: '16 vCPU',
    ram: '32GB RAM',
    storage: '640GB NVMe',
    bandwidth: 'Unlimited',
    monthlyPrice: 79.99,
    yearlyPrice: 59.99,
    color: 'from-accent to-purple-400'
  }
];

const features = [
  { icon: <Scale className="h-6 w-6" />, title: 'Auto-Scaling', description: 'Automatically scale resources based on traffic' },
  { icon: <Zap className="h-6 w-6" />, title: 'Instant Provisioning', description: 'Deploy in seconds, not hours' },
  { icon: <Shield className="h-6 w-6" />, title: 'DDoS Protection', description: 'Enterprise-grade security included' },
  { icon: <Activity className="h-6 w-6" />, title: '99.99% Uptime', description: 'SLA-backed reliability guarantee' },
  { icon: <Globe className="h-6 w-6" />, title: 'Global CDN', description: 'Edge locations worldwide' },
  { icon: <Lock className="h-6 w-6" />, title: 'Isolated Resources', description: 'Dedicated CPU and RAM' },
];

const CloudHosting = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--secondary)/0.3)_0%,transparent_70%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
                <Cloud className="h-5 w-5" />
                <span className="text-sm font-medium">Cloud Infrastructure</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                Cloud Hosting
                <span className="block gradient-text-blue">Unlimited Scalability</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Enterprise-grade cloud infrastructure with dedicated resources, auto-scaling, and 99.99% uptime guarantee. Scale without limits.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="rocket" size="lg" className="gap-2 text-lg px-8">
                  Deploy Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text-blue">99.99%</div>
                <div className="text-muted-foreground">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text-orange">30+</div>
                <div className="text-muted-foreground">Data Centers</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text-green">&lt;50ms</div>
                <div className="text-muted-foreground">Avg Latency</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-accent">24/7</div>
                <div className="text-muted-foreground">Expert Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Cloud Hosting Plans
              </h2>
              <p className="text-muted-foreground mb-8">
                Dedicated resources with guaranteed performance
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 p-1.5 bg-muted rounded-full">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <span className="px-2 py-0.5 bg-success text-success-foreground text-xs rounded-full">
                    Save 25%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`relative bg-card/80 backdrop-blur-xl border-border/50 p-6 ${
                    plan.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-foreground mb-4">{plan.name}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Cpu className="h-4 w-4 text-secondary" />
                      <span className="text-foreground">{plan.cpu}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MemoryStick className="h-4 w-4 text-secondary" />
                      <span className="text-foreground">{plan.ram}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <HardDrive className="h-4 w-4 text-secondary" />
                      <span className="text-foreground">{plan.storage}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Activity className="h-4 w-4 text-secondary" />
                      <span className="text-foreground">{plan.bandwidth}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>

                  <Button variant={plan.popular ? 'rocket' : 'outline'} className="w-full">
                    Deploy Now
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Cloud Features
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-xl border-border/50 p-6">
                  <div className="inline-flex p-3 rounded-xl bg-secondary/20 text-secondary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CloudHosting;
