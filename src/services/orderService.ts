import { supabase } from '@/integrations/supabase/client';
import { calculateCartTotal } from './cartService';
import { taxRateForCountry } from '@/services/priceUtils';

export interface Order {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  items: any[];
  created_at: string;
}

export async function createOrderFromCart(userId: string, couponCode?: string) {
  // Get cart items
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(`
      *,
      services:service_id (
        name,
        type
      )
    `)
    .eq('user_id', userId);

  if (cartError) throw cartError;

  if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');

  // Calculate total
  const { subtotal, discount, total } = await calculateCartTotal(userId, couponCode);
  const tax = total * taxRateForCountry('US'); // Assume US for now
  const finalTotal = total + tax;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      amount: finalTotal,
      currency: 'USD',
      status: 'pending',
      items: cartItems.map(item => ({
        service_id: item.service_id,
        service_name: item.services?.name || 'Unknown',
        service_type: item.services?.type || 'unknown',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        configuration: item.configuration,
        selected_addons: item.selected_addons,
        domain_name: item.domain_name,
        billing_cycle: item.billing_cycle
      }))
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order_items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    service_id: item.service_id,
    service_name: item.services?.name || 'Unknown',
    service_type: item.services?.type || 'unknown',
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    configuration: item.configuration,
    selected_addons: item.selected_addons,
    domain_name: item.domain_name,
    billing_cycle: item.billing_cycle
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // Clear cart
  const { error: clearError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (clearError) throw clearError;

  return order;
}

export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getOrder(orderId: string, userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data;
}