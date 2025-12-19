import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id?: string;
  user_id: string;
  service_id: string;
  quantity: number;
  addon_ids?: string[];
  configuration?: Record<string, any>;
  price_override?: number | null;
  added_at?: string;
}

export async function addToCart(userId: string, serviceId: string, config: Record<string, any> = {}, addons: string[] = []) {
  // Get service pricing from database
  const { data: service } = await supabase
    .from('services')
    .select('base_price, billing_cycle')
    .eq('id', serviceId)
    .single();

  if (!service) {
    throw new Error('Service not found');
  }

  // Get addon pricing
  let addonTotal = 0;
  if (addons.length > 0) {
    const { data: addonData } = await supabase
      .from('service_addons')
      .select('price')
      .in('id', addons);

    addonTotal = addonData?.reduce((sum, addon) => sum + (addon.price || 0), 0) || 0;
  }

  const unitPrice = service.base_price + addonTotal;
  const totalPrice = unitPrice; // For one unit, can be multiplied by quantity later

  const payload = {
    user_id: userId,
    service_id: serviceId,
    quantity: 1,
    configuration: config,
    selected_addons: addons,
    billing_cycle: service.billing_cycle,
    unit_price: unitPrice,
    total_price: totalPrice,
  };

  // Upsert so user only has one line per service
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(payload, { onConflict: ['user_id', 'service_id', 'configuration', 'selected_addons', 'domain_name'] })
    .select()
    .limit(1);

  if (error) {
    throw new Error(`Failed to add to cart: ${error.message}`);
  }

  return (data && data[0]) || payload;
}

export async function removeFromCart(userId: string, serviceId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('service_id', serviceId);
  if (error) throw error;
}

export async function getCart(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      services:service_id (
        name,
        type,
        base_price,
        billing_cycle
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get cart: ${error.message}`);
  }
  return (data || []) as CartItem[];
}

export async function clearCart(userId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}

export async function updateCartQuantity(userId: string, serviceId: string, quantity: number) {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('service_id', serviceId)
    .select()
    .limit(1);

  if (error) throw error;
  return data && data[0];
}

export function getServicePricingConfig() {
  return {
    'shared-monthly': { price: 4.99, name: 'Shared Hosting - Monthly' },
    'shared-annual': { price: 49.99, name: 'Shared Hosting - Annual' },
    'vps-monthly': { price: 19.99, name: 'VPS - Monthly' },
    'vps-annual': { price: 199.99, name: 'VPS - Annual' },
    'cloud-monthly': { price: 99.99, name: 'Cloud - Monthly' },
    'cloud-annual': { price: 999.99, name: 'Cloud - Annual' },
    'wordpress-monthly': { price: 9.99, name: 'WordPress - Monthly' },
    'wordpress-annual': { price: 99.99, name: 'WordPress - Annual' },
  } as Record<string, { price: number; name: string }>;
}

export async function calculateCartTotal(userId: string, couponCode?: string) {
  const items = await getCart(userId);
  let subtotal = 0;

  for (const item of items) {
    subtotal += (item.total_price || 0) * (item.quantity || 1);
  }

  // Handle discount codes
  let discount = 0;
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (coupon && subtotal >= (coupon.minimum_order || 0)) {
      if (coupon.type === 'percentage') {
        discount = subtotal * (coupon.value / 100);
      } else if (coupon.type === 'fixed') {
        discount = Math.min(coupon.value, subtotal);
      }
    }
  }

  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}
