import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Globe,
  Shield,
  Lock,
  Mail,
  RefreshCw,
  ArrowRight,
  Check,
  X,
  Loader2
} from 'lucide-react';

const popularTlds = [
  { extension: '.com', price: 12.99, renewal: 14.99 },
  { extension: '.net', price: 11.99, renewal: 13.99 },
  { extension: '.org', price: 10.99, renewal: 12.99 },
  { extension: '.io', price: 39.99, renewal: 49.99 },
  { extension: '.co', price: 9.99, renewal: 24.99 },
  { extension: '.dev', price: 14.99, renewal: 16.99 },
  { extension: '.app', price: 14.99, renewal: 16.99 },
  { extension: '.ai', price: 69.99, renewal: 89.99 },
];

const features = [
  { icon: <Shield className="h-6 w-6" />, title: 'WHOIS Privacy', description: 'Free domain privacy protection included' },
  { icon: <Lock className="h-6 w-6" />, title: 'Free SSL', description: 'SSL certificate included with every domain' },
  { icon: <Mail className="h-6 w-6" />, title: 'Email Forwarding', description: 'Free email forwarding to any address' },
  { icon: <RefreshCw className="h-6 w-6" />, title: 'Easy Transfer', description: 'Simple domain transfer process' },
];

const Domains = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ domain: string; available: boolean; price: number }> | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search
    setTimeout(() => {
      const baseName = searchQuery.replace(/\.[a-z]+$/i, '').toLowerCase();
      const results = popularTlds.slice(0, 6).map(tld => ({
        domain: baseName + tld.extension,
        available: Math.random() > 0.3,
        price: tld.price
      }));
      setSearchResults(results);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.2)_0%,transparent_70%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Domain Registration</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                Find Your Perfect
                <span className="block gradient-text-orange">Domain Name</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Register your domain with free WHOIS privacy, SSL certificate, and DNS management. Starting at just $9.99/year.
              </p>

              {/* Search Box */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your domain name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 text-lg bg-card border-border"
                    />
                  </div>
                  <Button 
                    variant="rocket" 
                    size="lg" 
                    className="h-14 px-8"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults && (
                <div className="max-w-2xl mx-auto mb-12">
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50 divide-y divide-border/50">
                    {searchResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          {result.available ? (
                            <Check className="h-5 w-5 text-success" />
                          ) : (
                            <X className="h-5 w-5 text-destructive" />
                          )}
                          <span className="font-medium text-foreground">{result.domain}</span>
                          {result.available && (
                            <span className="text-sm text-success">Available!</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-foreground">${result.price}/yr</span>
                          <Button 
                            variant={result.available ? 'rocket' : 'outline'} 
                            size="sm"
                            disabled={!result.available}
                          >
                            {result.available ? 'Add to Cart' : 'Unavailable'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Popular TLDs */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Popular Domain Extensions
              </h2>
              <p className="text-muted-foreground">
                Choose from hundreds of domain extensions
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {popularTlds.map((tld, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-xl border-border/50 p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-foreground mb-2">{tld.extension}</div>
                  <div className="text-lg font-bold gradient-text-orange">${tld.price}</div>
                  <div className="text-sm text-muted-foreground">first year</div>
                  <div className="text-xs text-muted-foreground mt-2">then ${tld.renewal}/yr</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Everything Included
              </h2>
              <p className="text-muted-foreground">
                All domains come with premium features at no extra cost
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-xl border-border/50 p-6 text-center">
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

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Bundle & Save
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get hosting + domain + SSL + email together and save up to 60%
              </p>
              <Button variant="rocket" size="lg" className="gap-2">
                View Bundles
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Domains;
