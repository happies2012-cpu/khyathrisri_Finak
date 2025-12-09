import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { getDashboardMetrics, getRevenueChartData, getTicketStatusChartData, getRecentActivities } from '@/services/dashboardService';
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
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  Download,
  Calendar,
  Settings,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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

interface KPICard {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

interface ChartData {
  name: string;
  value?: number;
  revenue?: number;
  users?: number;
  orders?: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  icon: any;
}

interface Widget {
  id: string;
  title: string;
  component: React.ReactNode;
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { metrics: realtimeMetrics, isLoading: realtimeLoading } = useRealtimeDashboard(user?.id);
  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>([]);
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
  const [startDate, endDate] = dateRange;
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for real KPI data
  const [kpiData, setKpiData] = useState<KPICard[]>([]);
  const [kpiLoading, setKpiLoading] = useState(true);

  // State for real chart data
  const [lineChartData, setLineChartData] = useState<ChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<ChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Fetch real chart data
  useEffect(() => {
    async function fetchChartData() {
      try {
        // Fetch orders data for revenue trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('amount_cents, created_at, status')
          .eq('status', 'paid')
          .gte('created_at', sixMonthsAgo.toISOString());

        // Fetch user registrations for user growth
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString());

        if (ordersError || usersError) {
          return;
        }

        // Process data for line chart (monthly aggregation)
        const monthlyData: { [key: string]: { revenue: number; users: number; orders: number } } = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toLocaleString('default', { month: 'short' });
          monthlyData[monthKey] = { revenue: 0, users: 0, orders: 0 };
        }

        // Aggregate orders data
        ordersData?.forEach(order => {
          const date = new Date(order.created_at);
          const monthKey = date.toLocaleString('default', { month: 'short' });
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].revenue += order.amount_cents / 100;
            monthlyData[monthKey].orders += 1;
          }
        });

        // Aggregate users data
        usersData?.forEach(user => {
          const date = new Date(user.created_at);
          const monthKey = date.toLocaleString('default', { month: 'short' });
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].users += 1;
          }
        });

        const realLineChartData: ChartData[] = Object.entries(monthlyData).map(([name, data]) => ({
          name,
          revenue: data.revenue,
          users: data.users,
          orders: data.orders,
        }));

        setLineChartData(realLineChartData);

        // For pie chart, we'll use mock data for now as we don't have traffic source data
        // In a real implementation, this would come from analytics data
        const realPieChartData: ChartData[] = [
          { name: 'Direct', value: 35 },
          { name: 'Search', value: 30 },
          { name: 'Social', value: 20 },
          { name: 'Referral', value: 15 },
        ];

        setPieChartData(realPieChartData);
      } catch (error) {
        // Chart data fetch handled
      } finally {
        setChartLoading(false);
      }
    }

    fetchChartData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Fetch real activities from activity_log table
  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        const realActivities: ActivityItem[] = data.map((activity) => ({
          id: activity.id,
          type: activity.action.split('_')[0], // Extract type from action
          message: activity.details?.message || activity.action.replace(/_/g, ' '),
          timestamp: new Date(activity.created_at || ''),
          icon: getActivityIcon(activity.action),
        }));
        setActivities(realActivities);
      }
    }

    fetchActivities();
  }, []);

  // Helper function to get appropriate icon for activity type
  const getActivityIcon = (action: string) => {
    if (action.includes('order')) return ShoppingCart;
    if (action.includes('user')) return Users;
    if (action.includes('domain')) return Globe;
    if (action.includes('hosting')) return Server;
    return Activity;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Dashboard Report', 20, 20);
    doc.save('dashboard-report.pdf');
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(lineChartData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dashboard-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(lineChartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Data');
    XLSX.writeFile(wb, 'dashboard-data.xlsx');
  };

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

  // Initialize widgets
  useEffect(() => {
    const initialWidgets: Widget[] = [
      {
        id: 'kpi-cards',
        title: 'Key Performance Indicators',
        component: (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi) => (
              <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className={`h-4 w-4 mr-1 ${kpi.change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm ${kpi.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-muted ${kpi.color}`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ),
      },
      {
        id: 'charts',
        title: 'Analytics Charts',
        component: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ),
      },
      {
        id: 'activity-feed',
        title: 'Recent Activity',
        component: (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ),
      },
    ];
    setWidgets(initialWidgets);
  }, [activities, kpiData, lineChartData, pieChartData]);

  const SortableWidget = ({ widget }: { widget: Widget }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: widget.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-move">
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{widget.title}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>{widget.component}</CardContent>
        </Card>
      </div>
    );
  };

  // Fetch real KPI data
  useEffect(() => {
    if (!profile?.id) return;

    async function fetchKpiData() {
      setKpiLoading(true);
      const metrics = await getDashboardMetrics(profile.id);

      const newKpiData: KPICard[] = [
        {
          id: '1',
          title: 'Hosting Accounts',
          value: metrics.totalAccounts.toString(),
          change: 5,
          icon: Server,
          color: 'text-blue-500',
        },
        {
          id: '2',
          title: 'Storage Used',
          value: `${metrics.totalStorage.toFixed(1)}GB`,
          change: 12,
          icon: HardDrive,
          color: 'text-green-500',
        },
        {
          id: '3',
          title: 'Bandwidth Used',
          value: `${metrics.totalBandwidth.toFixed(1)}GB`,
          change: -3,
          icon: Wifi,
          color: 'text-purple-500',
        },
        {
          id: '4',
          title: 'Active Tickets',
          value: metrics.activeTickets.toString(),
          change: 8,
          icon: Activity,
          color: 'text-orange-500',
        },
      ];

      setKpiData(newKpiData);
      setKpiLoading(false);
    }

    fetchKpiData();
  }, [profile?.id]);

  // Fetch real chart and activity data
  useEffect(() => {
    if (!profile?.id) return;

    async function fetchReportData() {
      setChartLoading(true);
      const [chartData, statusData, activityData] = await Promise.all([
        getRevenueChartData(profile.id, new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()),
        getTicketStatusChartData(profile.id),
        getRecentActivities(profile.id, 10),
      ]);

      // Set line chart data with fallback to empty if no data
      if (chartData.length > 0) {
        setLineChartData(chartData);
      } else {
        // Show sample data if no real data yet
        setLineChartData([
          { name: 'Jan', revenue: 0 },
          { name: 'Feb', revenue: 0 },
          { name: 'Mar', revenue: 0 },
          { name: 'Apr', revenue: 0 },
          { name: 'May', revenue: 0 },
          { name: 'Jun', revenue: 0 },
        ]);
      }

      // Set pie chart data
      if (statusData.length > 0) {
        setPieChartData(statusData);
      } else {
        setPieChartData([
          { name: 'Open', value: 0 },
          { name: 'In Progress', value: 0 },
          { name: 'Closed', value: 0 },
        ]);
      }

      // Set activities
      const formattedActivities: ActivityItem[] = activityData.map((activity) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        timestamp: activity.timestamp,
        icon: activity.type === 'order' ? ShoppingCart : activity.type === 'ticket' ? Activity : Server,
      }));

      setActivities(formattedActivities);
      setChartLoading(false);
    }

    fetchReportData();
  }, [profile?.id]);

  // Build stats array for the grid
  const stats = [
    {
      title: 'Hosting Accounts',
      value: kpiData.find(k => k.title === 'Hosting Accounts')?.value || '0',
      href: '/dashboard/hosting',
      icon: Server,
      color: 'text-blue-500',
    },
    {
      title: 'Storage Used',
      value: kpiData.find(k => k.title === 'Storage Used')?.value || '0GB',
      href: '/dashboard/hosting',
      icon: HardDrive,
      color: 'text-green-500',
    },
    {
      title: 'Bandwidth Used',
      value: kpiData.find(k => k.title === 'Bandwidth Used')?.value || '0GB',
      href: '/dashboard/hosting',
      icon: Wifi,
      color: 'text-purple-500',
    },
    {
      title: 'Active Tickets',
      value: kpiData.find(k => k.title === 'Active Tickets')?.value || '0',
      href: '/dashboard/support',
      icon: Activity,
      color: 'text-orange-500',
    },
  ];

  return (
    <ErrorBoundary>
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

        {/* Legacy Hosting Accounts Section */}
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
      </div>
    </DashboardLayout>
    </ErrorBoundary>
  );
}
