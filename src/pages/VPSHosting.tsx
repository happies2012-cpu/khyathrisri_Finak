import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Server, Cpu, HardDrive, Wifi, Shield, Zap, ArrowRight, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LiveChat from '@/components/home/LiveChat';
import ServiceConfigurator from '@/components/ServiceConfigurator';

const vpsPlans = [
  {
    name: 'VPS Starter',
    price: 4.99,
    originalPrice: 12.99,
    specs: {
      cpu: '1 vCPU',
      ram: '1 GB RAM',
      storage: '20 GB NVMe SSD',
      bandwidth: '1 TB Bandwidth',
      ip: '1 Dedicated IP',
    },
    features: ['Full Root Access', 'Weekly Backups', 'DDoS Protection', '24/7 Support'],
    popular: false,
  },
  {
    name: 'VPS Business',
    price: 9.99,
    originalPrice: 24.99,
    specs: {
      cpu: '2 vCPU',
      ram: '4 GB RAM',
      storage: '80 GB NVMe SSD',
      bandwidth: '4 TB Bandwidth',
      ip: '1 Dedicated IP',
    },
    features: ['Full Root Access', 'Daily Backups', 'DDoS Protection', '24/7 Priority Support', 'Free SSL Certificate'],
    popular: true,
  },
  {
    name: 'VPS Pro',
    price: 19.99,
    originalPrice: 49.99,
    specs: {
      cpu: '4 vCPU',
      ram: '8 GB RAM',
      storage: '160 GB NVMe SSD',
      bandwidth: '8 TB Bandwidth',
      ip: '2 Dedicated IPs',
    },
    features: ['Full Root Access', 'Daily Backups', 'Advanced DDoS Protection', '24/7 Priority Support', 'Free SSL Certificate', 'Managed Services'],
    popular: false,
  },
  {
    name: 'VPS Enterprise',
    price: 39.99,
    originalPrice: 99.99,
    specs: {
      cpu: '8 vCPU',
      ram: '16 GB RAM',
      storage: '320 GB NVMe SSD',
      bandwidth: 'Unlimited',
      ip: '4 Dedicated IPs',
    },
    features: ['Full Root Access', 'Hourly Backups', 'Enterprise DDoS Protection', 'Dedicated Account Manager', 'Free SSL Certificate', 'Fully Managed Services', 'Custom Solutions'],
    popular: false,
  },
];

const VPSHosting = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute inset-0 server-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
              <Server className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Enterprise-Grade VPS Hosting</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="text-foreground">High-Performance</span>
              <br />
              <span className="gradient-text-blue">VPS Servers</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Unleash the power of dedicated resources with our lightning-fast VPS hosting. 
              Full root access, NVMe SSD storage, and 99.99% uptime guarantee.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="rocket" size="xl">
                <Zap className="h-5 w-5" />
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="xl">
                Compare Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-4 p-2 rounded-full bg-muted/50 border border-border">
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
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="px-2 py-0.5 text-xs bg-success/20 text-success rounded-full">
                  Save 60%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VPS Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vpsPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'border-2 border-primary ring-4 ring-primary/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black gradient-text-orange">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <span className="text-sm text-muted-foreground line-through">${plan.originalPrice}/mo</span>
                </div>

                {/* Server Specs */}
                <div className="space-y-3 mb-6 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{plan.specs.cpu}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium">{plan.specs.ram}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">{plan.specs.storage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{plan.specs.bandwidth}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'rocket' : 'outline'}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configuration Builder */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              <span className="gradient-text-orange">Build Your Own</span> VPS
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Customize your virtual server specifications to match your exact requirements
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ServiceConfigurator serviceType="vps" basePrice={9.99} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Why Choose Our <span className="gradient-text-blue">VPS Hosting</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'NVMe SSD Storage',
                description: 'Ultra-fast NVMe SSD drives for lightning-fast read/write speeds',
                color: 'text-primary',
              },
              {
                icon: Shield,
                title: 'DDoS Protection',
                description: 'Enterprise-grade DDoS protection to keep your server secure',
                color: 'text-success',
              },
              {
                icon: Server,
                title: 'Full Root Access',
                description: 'Complete control over your server with full root access',
                color: 'text-secondary',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-8 rounded-2xl text-center">
                <div className={`inline-flex p-4 rounded-2xl bg-muted/50 mb-6 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <LiveChat />
    </div>
  );
};

export default VPSHosting;
