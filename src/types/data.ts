export interface DataItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  metadata: Record<string, any>;
}

export interface TableFilters {
  status?: string[];
  category?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}

export interface TableSort {
  id: string;
  desc: boolean;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface FormData {
  name: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  attachments?: File[];
  richContent?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  activeSubscriptions: number;
  totalDomains: number;
  supportTickets: number;
  pendingTickets: number;
  revenueGrowth: number;
  subscriptionChurn: number;
}

export interface SessionInfo {
  id: string;
  user_id: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  ip_address: string;
  user_agent: string;
  last_activity: Date;
  created_at: Date;
  is_active: boolean;
}

export interface DNSRecord {
  id: string;
  domain_name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
  status: 'active' | 'pending' | 'failed';
  created_at: Date;
  updated_at: Date;
}