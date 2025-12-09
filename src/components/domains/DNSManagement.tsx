import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, CheckCircle, Clock, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeDNS } from '@/hooks/useRealtimeDNS';
import { toast } from 'sonner';
import { getUserDomains, addDNSRecord, deleteDNSRecord, validateDNSRecord, getRecommendedRecords } from '@/services/dnsService';
import type { Domain, DNSRecord } from '@/services/dnsService';

export default function DNSManagement() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { records: dnsRecords, isLoading: dnsLoading, error: dnsError } = useRealtimeDNS(selectedDomain || undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for adding new record
  const [newRecord, setNewRecord] = useState({
    type: 'A',
    name: '',
    value: '',
    ttl: 3600,
    priority: '',
  });

  useEffect(() => {
    if (user) {
      loadDomains();
    }
  }, [user]);

  const loadDomains = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await getUserDomains(user.id);
      setDomains(data || []);
      if (data && data.length > 0) {
        setSelectedDomain(data[0].domain_name);
      }
    } catch (error) {
      toast.error('Failed to load domains');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!selectedDomain || !newRecord.name || !newRecord.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate record
    const validation = validateDNSRecord(newRecord.type, newRecord.value);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid DNS record');
      return;
    }

    setIsAdding(true);
    try {
      const { error, data } = await addDNSRecord(
        selectedDomain,
        newRecord.type,
        newRecord.name,
        newRecord.value,
        newRecord.ttl,
        newRecord.priority ? parseInt(newRecord.priority) : undefined
      );

      if (error) throw error;

      // Reset form after successful addition
      // Real-time hook will auto-update the records list
      setNewRecord({ type: 'A', name: '', value: '', ttl: 3600, priority: '' });
      toast.success('DNS record added successfully');
    } catch (error) {
      toast.error('Failed to add DNS record');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this DNS record?')) return;

    try {
      const { error } = await deleteDNSRecord(recordId);
      if (error) throw error;

      // Real-time hook will auto-update the records list
      toast.success('DNS record deleted');
    } catch (error) {
      toast.error('Failed to delete DNS record');
    }
  };

  const handleLoadTemplate = (platform: 'wordpress' | 'wix' | 'shopify' | 'email') => {
    const recommended = getRecommendedRecords(platform);
    // In a real app, this would populate the form with template values
    toast.info(`${platform.charAt(0).toUpperCase() + platform.slice(1)} template loaded`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Manage Domains
          </CardTitle>
          <CardDescription>View and manage your domain registrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {domains.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No domains registered yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDomain === domain.domain_name
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDomain(domain.domain_name)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{domain.domain_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {domain.expires_at.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={domain.status === 'active' ? 'default' : 'secondary'}
                    >
                      {domain.status}
                    </Badge>
                  </div>
                  {domain.is_primary && (
                    <Badge variant="outline" className="mt-2">
                      Primary
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNS Records */}
      {selectedDomain && (
        <Card>
          <CardHeader>
            <CardTitle>DNS Records for {selectedDomain}</CardTitle>
            <CardDescription>
              Add and manage DNS records for your domain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Setup Templates</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['wordpress', 'wix', 'shopify', 'email'].map((platform) => (
                  <Button
                    key={platform}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadTemplate(platform as any)}
                    className="capitalize"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add New Record Form */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/30">
              <h3 className="font-medium">Add DNS Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newRecord.type} onValueChange={(value) => setNewRecord({ ...newRecord, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (IPv4)</SelectItem>
                      <SelectItem value="AAAA">AAAA (IPv6)</SelectItem>
                      <SelectItem value="CNAME">CNAME</SelectItem>
                      <SelectItem value="MX">MX (Mail)</SelectItem>
                      <SelectItem value="TXT">TXT</SelectItem>
                      <SelectItem value="NS">NS</SelectItem>
                      <SelectItem value="SRV">SRV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="@ or subdomain"
                    value={newRecord.name}
                    onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Value</Label>
                  <Input
                    placeholder="192.0.2.1 or example.com"
                    value={newRecord.value}
                    onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                  />
                </div>

                <div>
                  <Label>TTL (seconds)</Label>
                  <Input
                    type="number"
                    min="60"
                    max="86400"
                    value={newRecord.ttl}
                    onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Priority (optional)</Label>
                  <Input
                    type="number"
                    placeholder="For MX/SRV records"
                    value={newRecord.priority}
                    onChange={(e) => setNewRecord({ ...newRecord, priority: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleAddRecord} disabled={isAdding} className="w-full">
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>

            {/* Existing Records */}
            {dnsError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {dnsError}
              </div>
            )}

            {dnsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : dnsRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No DNS records yet. Add one to get started.
              </p>
            ) : (
              <div className="space-y-2">
                <h3 className="font-medium">Existing Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">TTL</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-right p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dnsRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{record.type}</td>
                          <td className="p-2">{record.name || '@'}</td>
                          <td className="p-2 text-xs break-words">{record.value}</td>
                          <td className="p-2 text-xs">{record.ttl}s</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(record.status)}
                              <span className="capitalize text-xs">{record.status}</span>
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
