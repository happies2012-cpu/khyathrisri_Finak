import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Zap,
  Globe,
  Database,
  Mail,
  FileText,
  Settings,
  Upload,
  Download,
  Trash2,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import { useParams } from 'react-router-dom';

interface HostingAccount {
  id: string;
  name: string;
  plan: string;
  status: string;
  domain: string;
  created_at: string;
}

const HostingControlPanel: React.FC = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState<HostingAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cpu: 45,
    memory: 60,
    disk: 30,
    bandwidth: 70
  });

  useEffect(() => {
    loadAccount();
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        disk: prev.disk, // Disk doesn't change much
        bandwidth: Math.max(0, Math.min(100, prev.bandwidth + (Math.random() - 0.5) * 15))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [accountId]);

  const loadAccount = async () => {
    // Mock account data - in real app, fetch from API
    setAccount({
      id: accountId || '1',
      name: 'My Hosting Account',
      plan: 'VPS Business',
      status: 'active',
      domain: 'example.com',
      created_at: '2025-01-15T10:00:00Z'
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold">Control Panel</h1>
            <p className="text-muted-foreground">{account?.domain} - {account?.plan}</p>
          </div>
          <Badge variant={account?.status === 'active' ? 'default' : 'secondary'}>
            {account?.status}
          </Badge>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Cpu className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">CPU Usage</p>
                  <Progress value={stats.cpu} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.cpu.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Server className="h-8 w-8 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Memory</p>
                  <Progress value={stats.memory} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.memory.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <HardDrive className="h-8 w-8 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Disk Usage</p>
                  <Progress value={stats.disk} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.disk.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Globe className="h-8 w-8 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Bandwidth</p>
                  <Progress value={stats.bandwidth} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.bandwidth.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="databases">Databases</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Start Services
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Services
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Server
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm">Server restarted successfully</p>
                      <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm">SSL certificate renewed</p>
                      <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm">Backup completed</p>
                      <span className="text-xs text-muted-foreground ml-auto">2d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File Manager
                  </span>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Modified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">public_html</TableCell>
                        <TableCell>Directory</TableCell>
                        <TableCell>2025-01-15</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">index.php</TableCell>
                        <TableCell>2.3 KB</TableCell>
                        <TableCell>2025-01-14</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="databases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Databases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Database Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">wp_database</TableCell>
                      <TableCell>MySQL</TableCell>
                      <TableCell>45 MB</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">admin@example.com</TableCell>
                      <TableCell>500 MB / 1 GB</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Backup</p>
                      <p className="text-sm text-muted-foreground">Last backup: 2025-01-18 02:00</p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button>Create Backup</Button>
                    <Button variant="outline">Schedule Backup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Domain</label>
                    <p className="text-sm text-muted-foreground">{account?.domain}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <p className="text-sm text-muted-foreground">{account?.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {account ? new Date(account.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={account?.status === 'active' ? 'default' : 'secondary'}>
                      {account?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HostingControlPanel;