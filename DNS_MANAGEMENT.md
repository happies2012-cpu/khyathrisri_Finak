# DNS Management Setup Guide

This document outlines the setup steps required to enable DNS management in the KSFoundation hosting platform.

## Overview

The DNS management system allows users to:
- Manage domain registrations
- Create and manage DNS records (A, AAAA, CNAME, MX, TXT, NS, SRV)
- Check DNS propagation across nameservers
- Use templates for common platform setups (WordPress, Wix, Shopify, Email)
- Validate DNS record formats

## Files Created

### Backend Services
- `src/services/dnsService.ts` - DNS management service with 9 functions
- `supabase/migrations/20251209_dns_management.sql` - Database tables and RLS policies

### Supabase Edge Function
- `supabase/functions/check-dns-propagation/index.ts` - DNS propagation checker

### Frontend Components
- `src/components/domains/DNSManagement.tsx` - Complete DNS UI component

## Setup Instructions

### 1. Database Migration

Apply the DNS management migration:

```bash
supabase migration up 20251209_dns_management
```

This creates:
- `dns_records` table - Stores DNS records with validation
- `domains` table - User's domain registrations
- `user_domains_with_records` view - Combined domain + DNS data
- Proper RLS policies for user isolation

### 2. Deploy Edge Function

Deploy the DNS propagation checker:

```bash
supabase functions deploy check-dns-propagation
```

### 3. Add to Pages/Settings

Integrate DNS management into your domain management page:

```typescript
import DNSManagement from '@/components/domains/DNSManagement';

export default function DomainsPage() {
  return (
    <DashboardLayout>
      <DNSManagement />
    </DashboardLayout>
  );
}
```

## API Service Functions

### `getUserDomains(userId)`
Retrieves all domains owned by a user with metadata.

Returns: `Domain[]` with name, status, expiration, nameservers

### `getDNSRecords(domainName)`
Gets all DNS records for a specific domain.

Returns: `DNSRecord[]` with type, name, value, TTL, priority

### `addDNSRecord(domainName, type, name, value, ttl, priority)`
Creates a new DNS record for a domain.

Parameters:
- `domainName`: The domain name
- `type`: Record type (A, AAAA, CNAME, MX, TXT, NS, SRV)
- `name`: Record name (@ for root or subdomain)
- `value`: Record value (IP, domain, etc.)
- `ttl`: Time to live in seconds (default: 3600)
- `priority`: Optional priority for MX/SRV records

### `updateDNSRecord(recordId, updates)`
Updates an existing DNS record.

Allowed updates:
- `value` - New record value
- `ttl` - Time to live
- `priority` - Priority value
- `status` - Record status (pending|active|failed)

### `deleteDNSRecord(recordId)`
Deletes a DNS record.

### `checkDNSPropagation(domainName, recordName)`
Checks DNS propagation status across multiple nameservers.

Returns:
- `propagated` - Boolean if fully propagated
- `percentage` - Propagation percentage (0-100)
- `details` - Per-nameserver propagation status

### `getNameserverSuggestions(domainName)`
Returns recommended nameservers for a domain.

Default suggestion: CloudFlare nameservers

### `getDNSTemplates()`
Returns DNS record templates for common platforms.

### `validateDNSRecord(recordType, value)`
Validates DNS record format.

Supports validation for:
- A - IPv4 address validation
- AAAA - IPv6 address validation
- CNAME - Domain name validation
- MX - Domain name validation
- NS - Domain name validation
- TXT - String length validation (1-255 chars)
- SRV - Service record format validation

### `getRecommendedRecords(platform)`
Returns recommended DNS records for a specific platform.

Supported platforms:
- `wordpress` - WordPress hosting setup
- `wix` - Wix website builder
- `shopify` - Shopify e-commerce
- `email` - Email setup with SPF/DKIM/DMARC

## Database Schema

### domains
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- domain_name (TEXT, UNIQUE)
- is_primary (BOOLEAN)
- auto_renew (BOOLEAN)
- expires_at (TIMESTAMP)
- status (active|pending|expired|transfer_in_progress)
- nameservers (TEXT[])
- created_at, updated_at (TIMESTAMP)
```

### dns_records
```sql
- id (UUID, PK)
- domain_name (TEXT, FK)
- record_type (A|AAAA|CNAME|MX|TXT|NS|SRV)
- name (TEXT) - @ or subdomain
- value (TEXT) - IP/domain/text value
- ttl (INTEGER) - 60-86400 seconds
- priority (INTEGER) - Optional for MX/SRV
- status (pending|active|failed)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(domain_name, record_type, name, value)
```

### user_domains_with_records (VIEW)
Combined view showing domains with embedded DNS records as JSON array.

## Common DNS Record Examples

### WordPress
```
A record: @ → 192.0.2.1
CNAME record: www → @
MX record: @ → mail.example.com (priority 10)
```

### Gmail/Google Workspace
```
MX record: @ → aspmx.l.google.com (priority 5)
MX record: @ → alt1.aspmx.l.google.com (priority 10)
TXT record: @ → v=spf1 include:google.com ~all
TXT record: _dmarc → v=DMARC1; p=reject;
```

### Cloudflare
```
NS record: @ → anna.ns.cloudflare.com
NS record: @ → noah.ns.cloudflare.com
```

## DNS Record Status

- **pending** - Record created but not yet validated
- **active** - Record is active and propagated
- **failed** - Record validation failed

## UI Component Features

### DNSManagement Component
- Domain selector with expiration dates
- Add new DNS records with validation
- Quick setup templates for popular platforms
- Real-time DNS record listing
- Delete records with confirmation
- Status indicators for each record
- TTL and priority configuration
- Input validation before submission

## Security Considerations

1. **RLS Policies**
   - Users can only manage their own domains
   - DNS records protected through domain association
   - Row-level security enforced

2. **Input Validation**
   - All DNS values validated by type
   - TTL bounds enforced (60-86400 seconds)
   - Record names sanitized

3. **User Isolation**
   - Domain ownership verified before access
   - Cross-user domain access prevented
   - Audit trail via created_at/updated_at

## Troubleshooting

### DNS not propagating
- Verify nameservers are set correctly
- Check TTL value (typically 300-3600 for changes)
- Use check-dns-propagation function
- Wait up to 48 hours for global propagation

### Record validation fails
- Check record format for your type:
  - A: `192.0.2.1`
  - AAAA: `2001:db8::1`
  - CNAME: `example.com`
  - MX: `mail.example.com` with priority
  - TXT: String up to 255 chars

### Can't add records
- Domain must exist and be owned by user
- Verify RLS policies are enabled
- Check database migration applied

### Propagation check returns incomplete
- May take time for all nameservers to sync
- Different nameservers may have different caches
- Check again after TTL expires

## Integration Points

### Domain Registration Flow
```typescript
// After registering a domain
const domain = await createDomain(userId, domainName);
// User can then add DNS records
```

### Settings Page
```typescript
import DNSManagement from '@/components/domains/DNSManagement';

export default function Settings() {
  return (
    <div>
      <h2>Domain Management</h2>
      <DNSManagement />
    </div>
  );
}
```

### Automatic DNS Setup
```typescript
// Use templates for quick setup
const template = getRecommendedRecords('wordpress');
// Add each template record
```

## Next Steps

1. Apply DNS management migration
2. Deploy DNS propagation check function
3. Add DNSManagement component to your settings/domains page
4. Test adding DNS records
5. Verify DNS propagation with check-dns-propagation function
6. Configure domain integrations (WordPress, etc.)
7. Set up automated renewal reminders

## Best Practices

1. **TTL Management**
   - Use lower TTL (300-900) when making changes
   - Increase TTL (3600-86400) for stable records
   - Lower TTL = faster propagation but more DNS queries

2. **Record Priority**
   - MX records: Use 10, 20, 30 for backup servers
   - Lower numbers = higher priority
   - Always have backup MX records

3. **SPF/DKIM/DMARC**
   - Always implement SPF for email
   - Use DKIM for authentication
   - Set DMARC policy (reject, quarantine, none)

4. **Validation**
   - Validate all records before adding
   - Test DNS changes in staging first
   - Monitor propagation before relying on new records

5. **Documentation**
   - Document all custom DNS records
   - Keep backup of DNS configuration
   - Track changes in audit logs

## Support

For issues:
- Check record format with validateDNSRecord
- Verify domain ownership in database
- Check RLS policies are enabled
- Review DNS propagation status
- Check Supabase function logs for errors
