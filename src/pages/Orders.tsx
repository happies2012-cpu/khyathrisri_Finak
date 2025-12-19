import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrders } from '@/services/orderService';
import { formatCurrency } from '@/services/priceUtils';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const o = await getOrders(user!.id);
      setOrders(o);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <DashboardLayout><p>Please login</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border p-4 rounded">
                  <div className="flex justify-between">
                    <span>Order #{order.id.slice(-8)}</span>
                    <span>{formatCurrency(order.amount, order.currency)}</span>
                  </div>
                  <p>Status: {order.status}</p>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Orders;
