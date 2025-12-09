import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { accountSchema } from '@/schemas/validationSchemas';
import {
  Server,
  Plus,
  Search,
  MoreVertical,
  Globe,
  HardDrive,
  Wifi,
  MapPin,
  Power,
  Trash2,
  Settings,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HostingAccount {
  id: string;
  name: string;
  plan: string;
  domain: string | null;
  server_location: string;
  storage_used_gb: number;
  bandwidth_used_gb: number;
  is_active: boolean;
  created_at: string;
}

const serverLocations = [
  { value: 'us-east', label: 'US East (Virginia)' },
  { value: 'us-west', label: 'US West (Oregon)' },
  { value: 'eu-west', label: 'EU West (Ireland)' },
  { value: 'ap-south', label: 'Asia Pacific (Singapore)' },
];

export default function HostingAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<HostingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountLocation, setNewAccountLocation] = useState('us-east');
  const [creating, setCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: any) => {
    const fieldSchema = {
      name: accountSchema.pick({ name: true }),
      server_location: accountSchema.pick({ server_location: true }),
    }[field];

    if (!fieldSchema) return;

    const result = fieldSchema.safeParse({ [field]: value });
    const newErrors = { ...validationErrors };

    if (result.success) {
      delete newErrors[field];
    } else {
      newErrors[field] = result.error.errors[0]?.message || 'Invalid input';
    }
    setValidationErrors(newErrors);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('hosting_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load hosting accounts');
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  const createAccount = async () => {
    if (!user) return;

    const parsed = accountSchema.safeParse({ name: newAccountName.trim(), server_location: newAccountLocation });
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(', ');
      toast.error(`Validation error: ${errors}`);
      return;
    }

    setCreating(true);
    const { error } = await supabase.from('hosting_accounts').insert({
      owner_id: user.id,
      name: parsed.data.name,
      server_location: parsed.data.server_location,
    });

    if (error) {
      toast.error('Failed to create hosting account');
    } else {
      toast.success('Hosting account created!');
      setCreateDialogOpen(false);
      setNewAccountName('');
      setValidationErrors({});
      fetchAccounts();
    }
    setCreating(false);
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('hosting_accounts').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete account');
    } else {
      toast.success('Account deleted');
      fetchAccounts();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('hosting_accounts')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update account');
    } else {
      toast.success(isActive ? 'Account suspended' : 'Account activated');
      fetchAccounts();
    }
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'starter': return { storage: 25, bandwidth: 100 };
      case 'business': return { storage: 100, bandwidth: 1000 };
      case 'enterprise': return { storage: 500, bandwidth: 10000 };
      default: return { storage: 1, bandwidth: 10 };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hosting Accounts</h1>
            <p className="text-muted-foreground mt-1">Manage your web hosting services</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-rocket">
                <Plus className="h-4 w-4 mr-2" />
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Hosting Account</DialogTitle>
                <DialogDescription>
                  Set up a new hosting account for your website
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Website"
                    value={newAccountName}
                    onChange={(e) => {
                      setNewAccountName(e.target.value);
                      validateField('name', e.target.value);
                    }}
                    maxLength={50}
                    className={validationErrors.name ? 'border-destructive' : ''}
                  />
                  <div className="flex justify-between items-start">
                    {validationErrors.name ? (
                      <span className="text-xs text-destructive">{validationErrors.name}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Letters, numbers, spaces, and hyphens only</span>
                    )}
                    <span className={`text-xs ${newAccountName.length < 3 || newAccountName.length > 50 ? 'text-muted-foreground' : 'text-success'}`}>
                      {newAccountName.length}/50
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Server Location</Label>
                  <Select value={newAccountLocation} onValueChange={(value) => {
                    setNewAccountLocation(value);
                    validateField('server_location', value);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serverLocations.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAccount} disabled={creating || !newAccountName.trim() || newAccountName.length < 3 || Object.keys(validationErrors).length > 0}>
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Accounts List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No hosting accounts</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No accounts match your search' : 'Create your first hosting account to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAccounts.map((account) => {
              const limits = getPlanLimits(account.plan);
              const storagePercent = (account.storage_used_gb / limits.storage) * 100;
              const bandwidthPercent = (account.bandwidth_used_gb / limits.bandwidth) * 100;

              return (
                <Card key={account.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${account.is_active ? 'bg-success/10' : 'bg-muted'}`}>
                          <Server className={`h-6 w-6 ${account.is_active ? 'text-success' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{account.name}</h3>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? 'Active' : 'Suspended'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {account.plan}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {account.domain || 'No domain'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {serverLocations.find((l) => l.value === account.server_location)?.label || account.server_location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 lg:w-64">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              Storage
                            </span>
                            <span>{account.storage_used_gb}/{limits.storage}GB</span>
                          </div>
                          <Progress value={storagePercent} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              Bandwidth
                            </span>
                            <span>{account.bandwidth_used_gb}/{limits.bandwidth}GB</span>
                          </div>
                          <Progress value={bandwidthPercent} className="h-2" />
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
                            Open cPanel
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleActive(account.id, account.is_active)}>
                            <Power className="h-4 w-4 mr-2" />
                            {account.is_active ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteAccount(account.id)}
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
