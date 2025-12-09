import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalAccounts: number;
  totalStorage: number;
  totalBandwidth: number;
  activeTickets: number;
  totalRevenue: number;
}

export interface ChartDataPoint {
  name: string;
  revenue?: number;
  users?: number;
  orders?: number;
  value?: number;
}

export interface ActivityLog {
  id: string;
  type: 'order' | 'user' | 'domain' | 'ticket' | 'account';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Fetch dashboard KPI metrics
 */
export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  try {
    // Get hosting accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('hosting_accounts')
      .select('*')
      .eq('owner_id', userId);

    if (accountsError) throw accountsError;

    const totalAccounts = accounts?.length || 0;
    const totalStorage = accounts?.reduce((sum, acc) => sum + (acc.storage_used_gb || 0), 0) || 0;
    const totalBandwidth = accounts?.reduce((sum, acc) => sum + (acc.bandwidth_used_gb || 0), 0) || 0;

    // Get active tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open');

    if (ticketsError) throw ticketsError;

    const activeTickets = tickets?.length || 0;

    // Get total revenue from orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('amount_cents')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (ordersError) throw ordersError;

    const totalRevenue = orders?.reduce((sum, order) => sum + ((order.amount_cents || 0) / 100), 0) || 0;

    return {
      totalAccounts,
      totalStorage,
      totalBandwidth,
      activeTickets,
      totalRevenue,
    };
  } catch (error) {
    // Error handling with silent fail for metrics
    return {
      totalAccounts: 0,
      totalStorage: 0,
      totalBandwidth: 0,
      activeTickets: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Fetch revenue chart data for the past 6 months
 */
export async function getRevenueChartData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ChartDataPoint[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Group by month
    const chartData: { [key: string]: number } = {};

    orders?.forEach((order) => {
      const date = new Date(order.created_at);
      const monthKey = date.toLocaleString('default', { month: 'short' });

      if (!chartData[monthKey]) {
        chartData[monthKey] = 0;
      }
      chartData[monthKey] += (order.amount_cents || 0) / 100;
    });

    return Object.entries(chartData).map(([name, revenue]) => ({
      name,
      revenue,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Fetch ticket status distribution
 */
export async function getTicketStatusChartData(userId: string): Promise<ChartDataPoint[]> {
  try {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const statusCount: { [key: string]: number } = {};

    tickets?.forEach((ticket) => {
      const status = ticket.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Fetch recent activities from multiple tables
 */
export async function getRecentActivities(userId: string, limit: number = 10): Promise<ActivityLog[]> {
  try {
    const activities: ActivityLog[] = [];

    // Get recent orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    orders?.forEach((order) => {
      activities.push({
        id: order.id,
        type: 'order',
        message: `New order for ${order.plan || 'subscription'} plan`,
        timestamp: new Date(order.created_at),
        metadata: { plan: order.plan, amount: (order.amount_cents || 0) / 100 },
      });
    });

    // Get recent ticket updates
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    tickets?.forEach((ticket) => {
      activities.push({
        id: ticket.id,
        type: 'ticket',
        message: `Ticket "${ticket.subject}" - ${ticket.status}`,
        timestamp: new Date(ticket.updated_at),
        metadata: { status: ticket.status },
      });
    });

    // Get recent account updates
    const { data: accounts } = await supabase
      .from('hosting_accounts')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    accounts?.forEach((account) => {
      activities.push({
        id: account.id,
        type: 'account',
        message: `Account "${account.name}" - ${account.plan}`,
        timestamp: new Date(account.updated_at),
        metadata: { active: account.is_active },
      });
    });

    // Sort by timestamp descending and limit
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  } catch (error) {
    return [];
  }
}

/**
 * Fetch hosting account details with metrics
 */
export async function getHostingAccountMetrics(accountId: string) {
  try {
    const { data: account, error } = await supabase
      .from('hosting_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) throw error;

    return {
      storageUsed: account?.storage_used_gb || 0,
      storageLimit: 100,
      bandwidthUsed: account?.bandwidth_used_gb || 0,
      bandwidthLimit: 1000,
      isActive: account?.is_active || false,
      plan: account?.plan || 'free',
    };
  } catch (error) {
    return null;
  }
}
