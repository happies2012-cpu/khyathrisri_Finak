import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getScheduledTasks, toggleTask, runTaskManually, processScheduledTasks } from '@/services/automationService';
import { toast } from 'sonner';
import {
  Clock,
  Play,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ScheduledTask {
  id: string;
  name: string;
  type: 'backup' | 'maintenance' | 'renewal' | 'cleanup' | 'report';
  schedule: string;
  enabled: boolean;
  last_run?: string;
  next_run: string;
  metadata: any;
}

const Automation: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTask, setRunningTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const taskData = await getScheduledTasks();
      setTasks(taskData);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
    setLoading(false);
  };

  const handleToggleTask = async (taskId: string, enabled: boolean) => {
    try {
      await toggleTask(taskId, enabled);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, enabled } : task
      ));
      toast.success(`Task ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleRunTask = async (taskId: string) => {
    setRunningTask(taskId);
    try {
      await runTaskManually(taskId);
      toast.success('Task executed successfully');
      await loadTasks(); // Refresh to show updated last_run
    } catch (error) {
      toast.error('Task execution failed');
    }
    setRunningTask(null);
  };

  const handleRunAllTasks = async () => {
    try {
      await processScheduledTasks();
      toast.success('All scheduled tasks processed');
      await loadTasks();
    } catch (error) {
      toast.error('Failed to process tasks');
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'backup': return '💾';
      case 'maintenance': return '🔧';
      case 'renewal': return '🔄';
      case 'cleanup': return '🗑️';
      case 'report': return '📊';
      default: return '⚙️';
    }
  };

  const getTaskStatus = (task: ScheduledTask) => {
    if (!task.enabled) return <Badge variant="secondary">Disabled</Badge>;
    if (runningTask === task.id) return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;

    const nextRun = new Date(task.next_run);
    const now = new Date();
    const timeDiff = nextRun.getTime() - now.getTime();

    if (timeDiff < 0) return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    if (timeDiff < 60 * 60 * 1000) return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;

    return <Badge className="bg-green-100 text-green-800">Scheduled</Badge>;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Automation & Scheduled Tasks</h1>
            <p className="text-muted-foreground">Manage automated tasks and cron jobs</p>
          </div>
          <Button onClick={handleRunAllTasks} className="btn-rocket">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run All Tasks
          </Button>
        </div>

        {/* Task Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{tasks.filter(t => t.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Running Now</p>
                  <p className="text-2xl font-bold">{runningTask ? 1 : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => {
                      if (!t.enabled) return false;
                      const nextRun = new Date(t.next_run);
                      const now = new Date();
                      const timeDiff = nextRun.getTime() - now.getTime();
                      return timeDiff > 0 && timeDiff < 60 * 60 * 1000; // Due in next hour
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => {
                      if (!t.enabled) return false;
                      const nextRun = new Date(t.next_run);
                      const now = new Date();
                      return nextRun.getTime() < now.getTime();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTaskTypeIcon(task.type)}</span>
                        {task.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {task.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {task.schedule}
                    </TableCell>
                    <TableCell>
                      {getTaskStatus(task)}
                    </TableCell>
                    <TableCell>
                      {task.last_run ? new Date(task.last_run).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {new Date(task.next_run).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={task.enabled}
                          onCheckedChange={(checked) => handleToggleTask(task.id, checked)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRunTask(task.id)}
                          disabled={runningTask === task.id || !task.enabled}
                        >
                          {runningTask === task.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Task Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cron Expression Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p><code>* * * * *</code> - Minute Hour Day Month DayOfWeek</p>
                <p><code>0 2 * * *</code> - Daily at 2:00 AM</p>
                <p><code>0 */6 * * *</code> - Every 6 hours</p>
                <p><code>0 9 1 * *</code> - First day of month at 9:00 AM</p>
                <p><code>0 3 * * 0</code> - Every Sunday at 3:00 AM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span>💾</span>
                <div>
                  <p className="font-medium">Backup</p>
                  <p className="text-sm text-muted-foreground">Database and file backups</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <div>
                  <p className="font-medium">Maintenance</p>
                  <p className="text-sm text-muted-foreground">System optimization and cleanup</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <div>
                  <p className="font-medium">Renewal</p>
                  <p className="text-sm text-muted-foreground">Subscription renewal processing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <div>
                  <p className="font-medium">Report</p>
                  <p className="text-sm text-muted-foreground">Automated report generation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Automation;</content>
