import { supabase } from '@/integrations/supabase/client';

export interface ServicePlan {
  id: string;
  name: string;
  type: 'shared' | 'vps' | 'cloud' | 'wordpress';
  price: number;
  features: string[];
  specs: {
    storage?: string;
    bandwidth?: string;
    cpu?: string;
    ram?: string;
    websites?: number;
  };
}

export interface UpgradeOption {
  fromPlan: ServicePlan;
  toPlan: ServicePlan;
  priceDifference: number;
  proratedAmount: number;
  effectiveDate: string;
}

export async function getAvailableUpgrades(currentPlanId: string): Promise<UpgradeOption[]> {
  // Mock available plans - in production, fetch from database
  const allPlans: ServicePlan[] = [
    {
      id: 'shared-basic',
      name: 'Shared Basic',
      type: 'shared',
      price: 4.99,
      features: ['1 Website', '10GB Storage', 'Unmetered Bandwidth'],
      specs: { websites: 1, storage: '10GB', bandwidth: 'unmetered' }
    },
    {
      id: 'shared-pro',
      name: 'Shared Pro',
      type: 'shared',
      price: 9.99,
      features: ['5 Websites', '50GB Storage', 'Unmetered Bandwidth', 'Free SSL'],
      specs: { websites: 5, storage: '50GB', bandwidth: 'unmetered' }
    },
    {
      id: 'vps-basic',
      name: 'VPS Basic',
      type: 'vps',
      price: 19.99,
      features: ['1 vCPU', '2GB RAM', '25GB SSD', '1TB Bandwidth'],
      specs: { cpu: '1 vCPU', ram: '2GB', storage: '25GB SSD', bandwidth: '1TB' }
    },
    {
      id: 'vps-pro',
      name: 'VPS Pro',
      type: 'vps',
      price: 39.99,
      features: ['2 vCPU', '4GB RAM', '50GB SSD', '2TB Bandwidth'],
      specs: { cpu: '2 vCPU', ram: '4GB', storage: '50GB SSD', bandwidth: '2TB' }
    },
    {
      id: 'cloud-basic',
      name: 'Cloud Basic',
      type: 'cloud',
      price: 49.99,
      features: ['2 vCPU', '4GB RAM', '100GB SSD', '3TB Bandwidth', 'Auto-scaling'],
      specs: { cpu: '2 vCPU', ram: '4GB', storage: '100GB SSD', bandwidth: '3TB' }
    }
  ];

  const currentPlan = allPlans.find(p => p.id === currentPlanId);
  if (!currentPlan) return [];

  // Find upgrade options (same type, higher price)
  const upgrades = allPlans
    .filter(plan =>
      plan.type === currentPlan.type &&
      plan.price > currentPlan.price
    )
    .map(plan => {
      const priceDifference = plan.price - currentPlan.price;
      // Simple proration - in production, calculate based on billing cycle
      const proratedAmount = priceDifference * 0.5; // Assume halfway through billing cycle

      return {
        fromPlan: currentPlan,
        toPlan: plan,
        priceDifference,
        proratedAmount,
        effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
      };
    });

  return upgrades;
}

export async function getAvailableDowngrades(currentPlanId: string): Promise<UpgradeOption[]> {
  const allPlans: ServicePlan[] = [
    {
      id: 'shared-basic',
      name: 'Shared Basic',
      type: 'shared',
      price: 4.99,
      features: ['1 Website', '10GB Storage', 'Unmetered Bandwidth'],
      specs: { websites: 1, storage: '10GB', bandwidth: 'unmetered' }
    },
    {
      id: 'shared-pro',
      name: 'Shared Pro',
      type: 'shared',
      price: 9.99,
      features: ['5 Websites', '50GB Storage', 'Unmetered Bandwidth', 'Free SSL'],
      specs: { websites: 5, storage: '50GB', bandwidth: 'unmetered' }
    },
    {
      id: 'vps-basic',
      name: 'VPS Basic',
      type: 'vps',
      price: 19.99,
      features: ['1 vCPU', '2GB RAM', '25GB SSD', '1TB Bandwidth'],
      specs: { cpu: '1 vCPU', ram: '2GB', storage: '25GB SSD', bandwidth: '1TB' }
    },
    {
      id: 'vps-pro',
      name: 'VPS Pro',
      type: 'vps',
      price: 39.99,
      features: ['2 vCPU', '4GB RAM', '50GB SSD', '2TB Bandwidth'],
      specs: { cpu: '2 vCPU', ram: '4GB', storage: '50GB SSD', bandwidth: '2TB' }
    }
  ];

  const currentPlan = allPlans.find(p => p.id === currentPlanId);
  if (!currentPlan) return [];

  // Find downgrade options (same type, lower price)
  const downgrades = allPlans
    .filter(plan =>
      plan.type === currentPlan.type &&
      plan.price < currentPlan.price
    )
    .map(plan => {
      const priceDifference = plan.price - currentPlan.price;
      const proratedAmount = priceDifference * 0.5; // Credit for downgrade

      return {
        fromPlan: currentPlan,
        toPlan: plan,
        priceDifference,
        proratedAmount,
        effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    });

  return downgrades;
}

export async function processUpgrade(accountId: string, upgradeOption: UpgradeOption): Promise<void> {
  try {
    // Update hosting account plan
    const { error: accountError } = await supabase
      .from('hosting_accounts')
      .update({
        plan: upgradeOption.toPlan.type,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (accountError) throw accountError;

    // Create upgrade order
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: 'current-user-id', // Get from context
        amount_cents: upgradeOption.proratedAmount * 100,
        currency: 'USD',
        status: 'completed',
        plan: upgradeOption.toPlan.type,
        billing_cycle: 'monthly',
        hosting_account_id: accountId
      });

    if (orderError) throw orderError;

    // Log the upgrade
    console.log(`Account ${accountId} upgraded from ${upgradeOption.fromPlan.name} to ${upgradeOption.toPlan.name}`);

  } catch (error) {
    console.error('Upgrade processing failed:', error);
    throw error;
  }
}

export async function processDowngrade(accountId: string, downgradeOption: UpgradeOption): Promise<void> {
  try {
    // Update hosting account plan
    const { error: accountError } = await supabase
      .from('hosting_accounts')
      .update({
        plan: downgradeOption.toPlan.type,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (accountError) throw accountError;

    // Create downgrade order (credit)
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: 'current-user-id', // Get from context
        amount_cents: downgradeOption.proratedAmount * 100, // Negative amount for credit
        currency: 'USD',
        status: 'completed',
        plan: downgradeOption.toPlan.type,
        billing_cycle: 'monthly',
        hosting_account_id: accountId
      });

    if (orderError) throw orderError;

    console.log(`Account ${accountId} downgraded from ${downgradeOption.fromPlan.name} to ${downgradeOption.toPlan.name}`);

  } catch (error) {
    console.error('Downgrade processing failed:', error);
    throw error;
  }
}</content>
</xai:function_call"> 

Assistant: Now let me implement advanced user management features for Gap 8 - team management and API keys. 

<xai:function_call name="write_to_file">
<parameter name="path">src/services/teamService.ts