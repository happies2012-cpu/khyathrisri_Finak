import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Users,
  DollarSign,
  Link,
  Copy,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Share2,
  Download
} from 'lucide-react';

interface AffiliateData {
  isAffiliate: boolean;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  referralLink: string;
  recentReferrals: any[];
  commissionRate: number;
}

const Affiliate: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadAffiliateData();
  }, [user]);

  const loadAffiliateData = async () => {
    if (!user) return;

    // Mock affiliate data - in production, fetch from database
    const mockData: AffiliateData = {
      isAffiliate: true,
      referralCode: 'KS' + user.id.slice(0, 6).toUpperCase(),
      totalReferrals: 23,
      totalEarnings: 345.67,
      pendingEarnings: 89.50,
      referralLink: `https://ksfoundation.com?ref=${'KS' + user.id.slice(0, 6).toUpperCase()}`,
      commissionRate: 20,
      recentReferrals: [
        { id: 1, email: 'user1@example.com', status: 'completed', earnings: 15.99, date: '2025-01-15' },
        { id: 2, email: 'user2@example.com', status: 'pending', earnings: 0, date: '2025-01-14' },
        { id: 3, email: 'user3@example.com', status: 'completed', earnings: 29.99, date: '2025-01-13' },
      ]
    };

    setData(mockData);
    setLoading(false);
  };

  const joinAffiliateProgram = async () => {
    setJoining(true);
    // Mock joining - in production, create affiliate record
    setTimeout(() => {
      setData(prev => prev ? { ...prev, isAffiliate: true } : null);
      toast.success('Welcome to the affiliate program!');
      setJoining(false);
    }, 1000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(data?.referralLink || '');
    toast.success('Referral link copied to clipboard!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.isAffiliate) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Affiliate Program</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our affiliate program and earn commissions by referring new customers.
              Get 20% commission on all referrals for life!
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Become an Affiliate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">20%</div>
                    <p className="text-sm">Commission Rate</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">Lifetime</div>
                    <p className="text-sm">Commission Duration</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">Monthly</div>
                    <p className="text-sm">Payout Schedule</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Program Benefits:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>20% commission on all hosting services</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time tracking dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Monthly payouts via PayPal/Bank</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Marketing materials provided</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={joinAffiliateProgram}
                  disabled={joining}
                  className="w-full"
                  size="lg"
                >
                  {joining ? 'Joining...' : 'Join Affiliate Program'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
            <p className="text-muted-foreground">Track your referrals and earnings</p>
          </div>
          <Badge className="bg-green-100 text-green-800">Active Affiliate</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{data.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${data.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Earnings</p>
                  <p className="text-2xl font-bold">${data.pendingEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold">{data.commissionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={data.referralLink} readOnly className="flex-1" />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this link with friends and earn {data.commissionRate}% commission on their purchases
            </p>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <Tabs defaultValue="referrals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="marketing">Marketing Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentReferrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.email}</TableCell>
                        <TableCell>
                          <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${referral.earnings.toFixed(2)}</TableCell>
                        <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>This Month</span>
                      <span className="font-semibold">$156.78</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Month</span>
                      <span className="font-semibold">$123.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid</span>
                      <span className="font-semibold">$256.17</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Next Payout</span>
                      <span className="font-semibold">$89.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">January 2025</p>
                        <p className="text-sm text-muted-foreground">Paid on Jan 1</p>
                      </div>
                      <span className="font-semibold">$123.45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">December 2024</p>
                        <p className="text-sm text-muted-foreground">Paid on Dec 1</p>
                      </div>
                      <span className="font-semibold">$132.72</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Banner Images
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Email Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Social Media Posts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Share</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    Share on Twitter
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share on Facebook
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share on LinkedIn
                  </Button>
                  <Button variant="outline" className="w-full">
                    Send via Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Affiliate;</content>
