import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Server, Globe, Shield, Zap, Users, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from '@/components/animations/Transitions';
import { Button } from '@/components/ui/button';
import { AnimatedPage } from '@/components/animations/AnimatedPage';

const LandingPage: React.FC = () => {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
                <span className="text-white font-bold text-xl">KSFOUNDATION</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
                <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
                <Link to="/auth">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="container mx-auto">
            <StaggerContainer>
              <div className="text-center max-w-4xl mx-auto">
                <StaggerItem>
                  <motion.h1 
                    className="text-5xl md:text-7xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    Launch Your
                    <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Digital Foundation
                    </span>
                  </motion.h1>
                </StaggerItem>
                <StaggerItem>
                  <motion.p 
                    className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Professional hosting, domain management, and cloud services built for scale. 
                    Deploy in seconds, manage with ease.
                  </motion.p>
                </StaggerItem>
                <StaggerItem>
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <Link to="/vps">
                      <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3">
                      View Demo
                    </Button>
                  </motion.div>
                </StaggerItem>
              </div>
            </StaggerContainer>

            {/* Hero Animation */}
            <motion.div 
              className="mt-16 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
                <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: Server, label: 'VPS Hosting', desc: 'Lightning-fast virtual servers' },
                      { icon: Globe, label: 'Domain Names', desc: 'Register your perfect domain' },
                      { icon: Shield, label: 'SSL Security', desc: 'Free SSL certificates' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                        <h3 className="text-white font-semibold mb-2">{item.label}</h3>
                        <p className="text-white/60 text-sm">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Everything You Need to
                  <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Succeed Online
                  </span>
                </h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  From domain registration to enterprise hosting, we've got you covered.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Blazing Fast',
                  description: 'NVMe SSD storage, latest CPUs, and global CDN for maximum performance.',
                  gradient: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'DDoS protection, automatic backups, and 24/7 monitoring.',
                  gradient: 'from-green-400 to-blue-500'
                },
                {
                  icon: Users,
                  title: 'Expert Support',
                  description: '24/7 technical support from hosting experts who actually care.',
                  gradient: 'from-blue-400 to-cyan-500'
                },
                {
                  icon: Globe,
                  title: 'Global Network',
                  description: 'Data centers worldwide with 99.9% uptime guarantee.',
                  gradient: 'from-blue-400 to-cyan-500'
                },
                {
                  icon: Server,
                  title: 'Scalable Infrastructure',
                  description: 'Scale from a small blog to enterprise applications seamlessly.',
                  gradient: 'from-blue-400 to-cyan-500'
                },
                {
                  icon: HeadphonesIcon,
                  title: 'Managed Services',
                  description: 'Let our experts handle technical details while you focus on growth.',
                  gradient: 'from-blue-400 to-cyan-500'
                },
              ].map((feature, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Simple, Transparent
                  <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Pricing
                  </span>
                </h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  No hidden fees. Cancel anytime. Start with a free trial.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: '$9.99',
                  period: '/month',
                  features: ['1 Website', '10GB Storage', '100GB Bandwidth', 'Free SSL', 'Email Support'],
                  gradient: 'from-blue-500 to-cyan-500',
                  popular: false
                },
                {
                  name: 'Professional',
                  price: '$29.99',
                  period: '/month',
                  features: ['5 Websites', '50GB Storage', '500GB Bandwidth', 'Free SSL', 'Priority Support', 'Daily Backups'],
                  gradient: 'from-blue-500 to-cyan-500',
                  popular: true
                },
                {
                  name: 'Enterprise',
                  price: '$99.99',
                  period: '/month',
                  features: ['Unlimited Websites', '200GB Storage', '2TB Bandwidth', 'Free SSL', '24/7 Phone Support', 'Daily Backups', 'Dedicated IP'],
                  gradient: 'from-blue-500 to-cyan-500',
                  popular: false
                },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  className={`relative ${plan.popular ? 'scale-105' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className={`bg-black/40 backdrop-blur-xl rounded-2xl border ${plan.popular ? 'border-blue-500/50' : 'border-white/10'} p-8 h-full`}>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/60">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-white/80">
                          <div className={`w-2 h-2 bg-gradient-to-r ${plan.gradient} rounded-full mr-3`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth">
                      <Button className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity text-white py-3`}>
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl p-12 text-center border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Launch Your
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Next Project?
                </span>
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of developers and businesses who trust KSFOUNDATION for their hosting needs.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
                  <span className="text-white font-bold text-xl">KSFOUNDATION</span>
                </div>
                <p className="text-white/60">
                  Professional hosting services for modern web.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Products</h4>
                <ul className="space-y-2 text-white/60">
                  <li><Link to="/vps" className="hover:text-white transition-colors">VPS Hosting</Link></li>
                  <li><Link to="/wordpress" className="hover:text-white transition-colors">WordPress</Link></li>
                  <li><Link to="/cloud" className="hover:text-white transition-colors">Cloud Hosting</Link></li>
                  <li><Link to="/domains" className="hover:text-white transition-colors">Domains</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-white/60">
              <p>&copy; 2024 KSFOUNDATION. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  );
};

export default LandingPage;
