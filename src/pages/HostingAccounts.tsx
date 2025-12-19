import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHostingAccounts, createHostingAccount } from '@/services/hostingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HostingAccounts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadAccounts();
  }, [user]);

  const loadAccounts = async () => {
    try {
      const a = await getHostingAccounts(user!.id);
      setAccounts(a);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    try {
      // Mock create with first service
      const { data: services } = await supabase.from('services').select('id').limit(1);
      if (services && services[0]) {
        await createHostingAccount(user!.id, services[0].id);
        loadAccounts();
        toast.success('Hosting account created');
      }
    } catch (e) {
      toast.error('Failed to create');
    }
  };

  if (!user) return <DashboardLayout><p>Please login</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Hosting Accounts</CardTitle>
          <Button onClick={handleCreate}>Create New Account</Button>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p>No hosting accounts yet</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border p-4 rounded">
                  <div className="flex justify-between">
                    <span>{account.plan}</span>
                    <span className={`px-2 py-1 rounded text-sm ${account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{account.status}</span>
                  </div>
                  <p>Provider: {account.provider}</p>
                  <p>{new Date(account.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default HostingAccounts;
