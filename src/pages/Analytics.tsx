import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  Users,
  DollarSign,
  Server,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number[];
    growth: number;
  };
  users: {
    total: number;
    active: number;
    new: number[];
  };
  services: {
    total: number;
    byType: { [key: string]: number };
    popular: string[];
  };
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // Mock analytics data - in production, fetch from database
    const mockData: AnalyticsData = {
      revenue: {
        total: 45678.90,
        monthly: [12000, 15000, 18000, 21000, 24000, 27000],
        growth: 15.5
      },
      users: {
        total: 1234,
        active: 892,
        new: [45, 67, 89, 123, 156, 178]
      },
      services: {
        total: 567,
        byType: {
          'Shared Hosting': 234,
          'VPS Hosting': 156,
          'Cloud Hosting': 89,
          'WordPress Hosting': 88
        },
        popular: ['Shared Hosting', 'VPS Hosting', 'WordPress Hosting']
      },
      performance: {
        uptime: 99.8,
        responseTime: 245,
        errorRate: 0.02
      }
    };

    setData(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
            <p className="text-muted-foreground">Business intelligence and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">Last 30 days</Badge>
            <button className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${data?.revenue.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{data?.revenue.growth}% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{data?.users.total.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">{data?.users.active} active this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Server className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                  <p className="text-2xl font-bold">{data?.services.total}</p>
                  <p className="text-xs text-purple-600">Across all plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold">{data?.performance.uptime}%</p>
                  <p className="text-xs text-orange-600">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {data?.revenue.monthly.map((amount, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${(amount / 30000) * 200}px` }}
                        ></div>
                        <span className="text-xs mt-2">${(amount / 1000).toFixed(0)}k</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Shared Hosting</span>
                    <span className="font-semibold">$18,450</span>
                  </div>
                  <Progress value={45} />
                  <div className="flex justify-between items-center">
                    <span>VPS Hosting</span>
                    <span className="font-semibold">$15,230</span>
                  </div>
                  <Progress value={37} />
                  <div className="flex justify-between items-center">
                    <span>Cloud Hosting</span>
                    <span className="font-semibold">$8,999</span>
                  </div>
                  <Progress value={18} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {data?.users.new.map((count, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${(count / 200) * 200}px` }}
                        ></div>
                        <span className="text-xs mt-2">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Segments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Free Users</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <Progress value={28} />
                  <div className="flex justify-between items-center">
                    <span>Basic Plan</span>
                    <span className="font-semibold">456</span>
                  </div>
                  <Progress value={37} />
                  <div className="flex justify-between items-center">
                    <span>Pro Plan</span>
                    <span className="font-semibold">323</span>
                  </div>
                  <Progress value={26} />
                  <div className="flex justify-between items-center">
                    <span>Enterprise</span>
                    <span className="font-semibold">113</span>
                  </div>
                  <Progress value={9} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data?.services.byType || {}).map(([service, count]) => (
                      <div key={service} className="flex justify-between items-center">
                        <span>{service}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(count / data.services.total) * 100} className="w-24" />
                          <span className="font-semibold w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.services.popular.map((service, index) => (
                      <div key={service} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{service}</span>
                        </div>
                        <Badge variant="secondary">
                          {data.services.byType[service]} active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Uptime</span>
                      <span className="font-semibold">{data?.performance.uptime}%</span>
                    </div>
                    <Progress value={data?.performance.uptime} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Response Time</span>
                      <span className="font-semibold">{data?.performance.responseTime}ms</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (data?.performance.responseTime || 0) / 10)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Error Rate</span>
                      <span className="font-semibold">{data?.performance.errorRate}%</span>
                    </div>
                    <Progress value={100 - (data?.performance.errorRate || 0) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Server Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>US-East-1</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>EU-West-1</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AP-South-1</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>CPU</span>
                      <span className="font-semibold">67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Memory</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Storage</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;</content>
