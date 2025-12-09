import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ticketSchema } from '@/schemas/validationSchemas';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Ticket {
  id: string;
  subject: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-secondary/20 text-secondary',
  high: 'bg-primary/20 text-primary',
  urgent: 'bg-destructive/20 text-destructive',
};

const statusIcons: Record<string, any> = {
  open: Clock,
  'in-progress': MessageSquare,
  resolved: CheckCircle,
  closed: CheckCircle,
};

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: any) => {
    const fieldSchema = {
      subject: ticketSchema.pick({ subject: true }),
      description: ticketSchema.pick({ description: true }),
      priority: ticketSchema.pick({ priority: true }),
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
    fetchTickets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('support-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Error handled
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const createTicket = async () => {
    if (!user) return;

    const parsed = ticketSchema.safeParse({
      subject: newTicket.subject.trim(),
      description: newTicket.description?.trim() || null,
      priority: newTicket.priority,
    });

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(', ');
      toast.error(`Validation error: ${errors}`);
      return;
    }

    setCreating(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
    });

    if (error) {
      toast.error('Failed to create ticket');
    } else {
      toast.success('Support ticket created!');
      setCreateDialogOpen(false);
      setNewTicket({ subject: '', description: '', priority: 'medium' });
      setValidationErrors({});
    }
    setCreating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground mt-1">Get help with your hosting services</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-rocket">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and our team will get back to you
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => {
                      setNewTicket({ ...newTicket, subject: e.target.value });
                      validateField('subject', e.target.value);
                    }}
                    maxLength={120}
                    className={validationErrors.subject ? 'border-destructive' : ''}
                  />
                  <div className="flex justify-between items-start">
                    {validationErrors.subject ? (
                      <span className="text-xs text-destructive">{validationErrors.subject}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Min 5, max 120 characters</span>
                    )}
                    <span className={`text-xs ${newTicket.subject.length < 5 ? 'text-muted-foreground' : 'text-success'}`}>
                      {newTicket.subject.length}/120
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => {
                      setNewTicket({ ...newTicket, priority: value });
                      validateField('priority', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about your issue..."
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => {
                      setNewTicket({ ...newTicket, description: e.target.value });
                      validateField('description', e.target.value);
                    }}
                    maxLength={2000}
                    className={validationErrors.description ? 'border-destructive' : ''}
                  />
                  <div className="flex justify-between items-start">
                    {validationErrors.description ? (
                      <span className="text-xs text-destructive">{validationErrors.description}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Optional, max 2000 characters</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {newTicket.description.length}/2000
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createTicket} disabled={creating || newTicket.subject.trim().length < 5 || Object.keys(validationErrors).length > 0}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">Find answers to common questions</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-full bg-secondary/10 w-fit mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our support team</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-full bg-success/10 w-fit mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold">System Status</h3>
              <p className="text-sm text-muted-foreground">Check service availability</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>Track and manage your support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No support tickets</h3>
                <p className="text-muted-foreground mb-4">
                  Create a ticket if you need help with anything
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const StatusIcon = statusIcons[ticket.status] || Clock;
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-background">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={priorityColors[ticket.priority]} variant="secondary">
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
