import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  Server,
  Globe,
  Activity,
  Zap,
  Plus,
  ArrowUpRight,
  TrendingUp,
  HardDrive,
  Wifi,
} from 'lucide-react';

interface HostingAccount {
  id: string;
  name: string;
  plan: string;
  domain: string | null;
  server_location: string;
  storage_used_gb: number;
  bandwidth_used_gb: number;
  is_active: boolean;
}

interface DomainRecord {
  id: string;
  domain_name: string;
  status: string;
  expiry_date: string | null;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>([]);
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [accountsRes, domainsRes] = await Promise.all([
        supabase.from('hosting_accounts').select('*').limit(5),
        supabase.from('domains').select('*').limit(5),
      ]);

      if (accountsRes.data) setHostingAccounts(accountsRes.data);
      if (domainsRes.data) setDomains(domainsRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const stats = [
    {
      title: 'Hosting Accounts',
      value: hostingAccounts.length,
      icon: Server,
      color: 'text-primary',
      href: '/dashboard/hosting',
    },
    {
      title: 'Domains',
      value: domains.length,
      icon: Globe,
      color: 'text-secondary',
      href: '/dashboard/domains',
    },
    {
      title: 'Uptime',
      value: '99.9%',
      icon: Activity,
      color: 'text-success',
      href: '/dashboard/activity',
    },
    {
      title: 'Plan',
      value: profile?.subscription_plan || 'Free',
      icon: Zap,
      color: 'text-accent',
      href: '/billing',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text-orange">{profile?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your hosting accounts
            </p>
          </div>
          <Button className="btn-rocket" asChild>
            <Link to="/dashboard/hosting/new">
              <Plus className="h-4 w-4 mr-2" />
              New Hosting Account
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1 capitalize">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Hosting Accounts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hosting Accounts</CardTitle>
              <CardDescription>Your active hosting services</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/hosting">
                View All <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : hostingAccounts.length === 0 ? (
              <div className="text-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No hosting accounts yet</h3>
                <p className="text-muted-foreground mb-4">Create your first hosting account to get started</p>
                <Button className="btn-rocket" asChild>
                  <Link to="/dashboard/hosting/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {hostingAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.domain || 'No domain'} • {account.server_location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={account.is_active ? 'default' : 'secondary'} className="capitalize">
                        {account.plan}
                      </Badge>
                      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {account.storage_used_gb}GB
                        </div>
                        <div className="flex items-center gap-1">
                          <Wifi className="h-4 w-4" />
                          {account.bandwidth_used_gb}GB
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="gradient-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Upgrade Your Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Get more storage, bandwidth, and premium features
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/billing">Upgrade</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Globe className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Register a Domain</h3>
                  <p className="text-sm text-muted-foreground">
                    Find and register your perfect domain name
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/domains">Search</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
