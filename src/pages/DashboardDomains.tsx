import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Globe,
  Plus,
  Search,
  MoreVertical,
  Calendar,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface Domain {
  id: string;
  domain_name: string;
  status: string;
  registration_date: string;
  expiry_date: string | null;
  auto_renew: boolean;
}

export default function DashboardDomains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Error handled
    } else {
      setDomains(data || []);
    }
    setLoading(false);
  };

  const deleteDomain = async (id: string) => {
    const { error } = await supabase.from('domains').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete domain');
    } else {
      toast.success('Domain deleted');
      fetchDomains();
    }
  };

  const filteredDomains = domains.filter((domain) =>
    domain.domain_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Domains</h1>
            <p className="text-muted-foreground mt-1">Manage your registered domains</p>
          </div>
          <Button className="btn-rocket" asChild>
            <Link to="/domains">
              <Plus className="h-4 w-4 mr-2" />
              Register Domain
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Domains List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : filteredDomains.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No domains registered</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No domains match your search' : 'Register your first domain to get started'}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/domains">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Domain
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDomains.map((domain) => {
              const daysUntilExpiry = getDaysUntilExpiry(domain.expiry_date);
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry < 30;

              return (
                <Card key={domain.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-secondary/10">
                          <Globe className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{domain.domain_name}</h3>
                            <Badge
                              variant={domain.status === 'active' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {domain.status}
                            </Badge>
                            {domain.auto_renew && (
                              <Badge variant="outline">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Auto-renew
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Registered: {new Date(domain.registration_date).toLocaleDateString()}
                            </span>
                            {domain.expiry_date && (
                              <span
                                className={`flex items-center gap-1 ${
                                  isExpiringSoon ? 'text-destructive' : ''
                                }`}
                              >
                                Expires: {new Date(domain.expiry_date).toLocaleDateString()}
                                {isExpiringSoon && ` (${daysUntilExpiry} days)`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Manage DNS
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Renew Domain
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteDomain(domain.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
