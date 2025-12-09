import { supabase } from '@/integrations/supabase/client';

export interface DNSRecord {
  id: string;
  domain_name: string;
  record_type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: 'pending' | 'active' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface Domain {
  id: string;
  user_id: string;
  domain_name: string;
  is_primary: boolean;
  auto_renew: boolean;
  expires_at: Date;
  status: 'active' | 'pending' | 'expired' | 'transfer_in_progress';
  nameservers: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * List user's domains
 */
export async function getUserDomains(userId: string): Promise<{ error: Error | null; data?: Domain[] }> {
  try {
    const { data, error } = await (supabase
      .from('domains' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) as any);

    if (error) {
      console.warn('Domains query error:', error);
      return { error: null, data: [] };
    }

    const domains = (data || []).map((domain: any) => ({
      ...domain,
      expires_at: new Date(domain.expires_at),
      created_at: new Date(domain.created_at),
      updated_at: new Date(domain.updated_at),
      nameservers: domain.nameservers || [],
    }));

    return { error: null, data: domains };
  } catch (error) {
    console.warn('Failed to fetch domains:', error);
    return { error: null, data: [] };
  }
}

/**
 * Get DNS records for a domain
 */
export async function getDNSRecords(domainName: string): Promise<{ error: Error | null; data?: DNSRecord[] }> {
  try {
    const { data, error } = await (supabase
      .from('dns_records' as any)
      .select('*')
      .eq('domain_name', domainName)
      .order('record_type', { ascending: true }) as any);

    if (error) {
      console.warn('DNS records query error:', error);
      return { error: null, data: [] };
    }

    const records = (data || []).map((record: any) => ({
      ...record,
      created_at: new Date(record.created_at),
      updated_at: new Date(record.updated_at),
    }));

    return { error: null, data: records };
  } catch (error) {
    console.warn('Failed to fetch DNS records:', error);
    return { error: null, data: [] };
  }
}

/**
 * Add a new DNS record
 */
export async function addDNSRecord(
  domainName: string,
  recordType: string,
  name: string,
  value: string,
  ttl: number = 3600,
  priority?: number
): Promise<{ error: Error | null; data?: DNSRecord }> {
  try {
    const { data, error } = await (supabase
      .from('dns_records' as any)
      .insert({
        domain_name: domainName,
        record_type: recordType,
        name,
        value,
        ttl,
        priority: priority || null,
        status: 'pending',
      })
      .select()
      .single() as any);

    if (error) throw error;

    return {
      error: null,
      data: {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      },
    };
  } catch (error) {
    console.error('Failed to add DNS record:', error);
    return { error: error instanceof Error ? error : new Error('Failed to add DNS record') };
  }
}

/**
 * Update a DNS record
 */
export async function updateDNSRecord(
  recordId: string,
  updates: Partial<Omit<DNSRecord, 'id' | 'domain_name' | 'created_at'>>
): Promise<{ error: Error | null }> {
  try {
    const { error } = await (supabase
      .from('dns_records' as any)
      .update(updates)
      .eq('id', recordId) as any);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to update DNS record:', error);
    return { error: error instanceof Error ? error : new Error('Failed to update DNS record') };
  }
}

/**
 * Delete a DNS record
 */
export async function deleteDNSRecord(recordId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await (supabase
      .from('dns_records' as any)
      .delete()
      .eq('id', recordId) as any);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to delete DNS record:', error);
    return { error: error instanceof Error ? error : new Error('Failed to delete DNS record') };
  }
}

/**
 * Check DNS propagation status
 */
export async function checkDNSPropagation(domainName: string, recordName: string): Promise<{ error: Error | null; data?: { propagated: boolean; percentage: number } }> {
  try {
    const { data, error } = await supabase.functions.invoke('check-dns-propagation', {
      body: {
        domainName,
        recordName,
      },
    });

    if (error) throw error;
    return { error: null, data };
  } catch (error) {
    console.error('Failed to check DNS propagation:', error);
    return { error: error instanceof Error ? error : new Error('Failed to check DNS propagation') };
  }
}

/**
 * Get nameserver suggestions for domain
 */
export async function getNameserverSuggestions(domainName: string): Promise<{ error: Error | null; data?: string[] }> {
  try {
    // CloudFlare nameservers as default suggestion
    const defaultNameservers = [
      'anna.ns.cloudflare.com',
      'noah.ns.cloudflare.com',
    ];

    return { error: null, data: defaultNameservers };
  } catch (error) {
    console.error('Failed to get nameserver suggestions:', error);
    return { error: error instanceof Error ? error : new Error('Failed to get nameserver suggestions') };
  }
}

/**
 * Get common DNS records template
 */
export function getDNSTemplates() {
  return {
    wordpress: [
      { type: 'A', name: '@', value: '192.0.2.1', ttl: 3600, description: 'Root domain A record' },
      { type: 'CNAME', name: 'www', value: '@', ttl: 3600, description: 'www subdomain' },
      { type: 'MX', name: '@', value: 'mail.example.com', ttl: 3600, priority: 10, description: 'Mail server' },
    ],
    wix: [
      { type: 'CNAME', name: '@', value: 'www.wix.com', ttl: 3600, description: 'Wix domain configuration' },
      { type: 'CNAME', name: 'www', value: 'www.wix.com', ttl: 3600, description: 'www subdomain' },
      { type: 'TXT', name: '@', value: 'v=spf1 include:wix.com ~all', ttl: 3600, description: 'SPF record' },
    ],
    shopify: [
      { type: 'A', name: '@', value: '23.185.0.1', ttl: 3600, description: 'Shopify A record' },
      { type: 'CNAME', name: 'www', value: 'shops.myshopify.com', ttl: 3600, description: 'Shopify www record' },
    ],
    email: [
      { type: 'MX', name: '@', value: 'mail.google.com', ttl: 3600, priority: 5, description: 'Google Workspace MX' },
      { type: 'TXT', name: '@', value: 'v=spf1 include:google.com ~all', ttl: 3600, description: 'SPF for email' },
      { type: 'TXT', name: '_dkim.default', value: 'v=DKIM1; k=rsa; p=...', ttl: 3600, description: 'DKIM record' },
      { type: 'TXT', name: '_dmarc', value: 'v=DMARC1; p=reject;', ttl: 3600, description: 'DMARC policy' },
    ],
  };
}

/**
 * Validate DNS record format
 */
export function validateDNSRecord(
  recordType: string,
  value: string
): { valid: boolean; error?: string } {
  switch (recordType.toUpperCase()) {
    case 'A':
      // IPv4 address
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
        return { valid: false, error: 'Invalid IPv4 address format' };
      }
      return { valid: true };

    case 'AAAA':
      // IPv6 address
      if (!/^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i.test(value)) {
        return { valid: false, error: 'Invalid IPv6 address format' };
      }
      return { valid: true };

    case 'CNAME':
    case 'MX':
    case 'NS':
      // Domain name
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.?$/i.test(value)) {
        return { valid: false, error: 'Invalid domain name format' };
      }
      return { valid: true };

    case 'TXT':
      // Text record - very permissive
      if (value.length === 0 || value.length > 255) {
        return { valid: false, error: 'TXT record must be 1-255 characters' };
      }
      return { valid: true };

    case 'SRV':
      // Service record format: priority weight port target
      if (!/^\d+ \d+ \d+ [a-z0-9.-]+$/i.test(value)) {
        return { valid: false, error: 'Invalid SRV record format' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown record type' };
  }
}

/**
 * Get recommended DNS records for common platforms
 */
export function getRecommendedRecords(platform: 'wordpress' | 'wix' | 'shopify' | 'email'): Array<{
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  description: string;
}> {
  const templates = getDNSTemplates();
  return templates[platform] || [];
}
