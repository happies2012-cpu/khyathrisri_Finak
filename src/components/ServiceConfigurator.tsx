import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addToCart } from '@/services/cartService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Cpu, HardDrive, Zap, DollarSign } from 'lucide-react';

interface ServiceConfig {
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  location: string;
}

interface ServiceConfiguratorProps {
  serviceType: 'vps' | 'cloud' | 'shared';
  basePrice: number;
}

const ServiceConfigurator: React.FC<ServiceConfiguratorProps> = ({ serviceType, basePrice }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ServiceConfig>({
    cpu: 1,
    ram: 1,
    storage: 25,
    bandwidth: 1,
    location: 'us-east'
  });
  const [loading, setLoading] = useState(false);

  const pricing = {
    vps: {
      cpu: 5, // $5 per core
      ram: 3, // $3 per GB
      storage: 0.1, // $0.10 per GB
      bandwidth: 2, // $2 per TB
    },
    cloud: {
      cpu: 8,
      ram: 4,
      storage: 0.15,
      bandwidth: 3,
    },
    shared: {
      cpu: 0,
      ram: 0,
      storage: 0,
      bandwidth: 0,
    }
  };

  const calculatePrice = () => {
    const p = pricing[serviceType];
    const cpuCost = config.cpu * p.cpu;
    const ramCost = config.ram * p.ram;
    const storageCost = config.storage * p.storage;
    const bandwidthCost = config.bandwidth * p.bandwidth;
    return basePrice + cpuCost + ramCost + storageCost + bandwidthCost;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    try {
      await addToCart(user.id, `${serviceType}-configured`, config);
      toast.success('Added to cart!');
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
    setLoading(false);
  };

  const specs = {
    vps: {
      cpu: { min: 1, max: 8, step: 1 },
      ram: { min: 1, max: 16, step: 1 },
      storage: { min: 25, max: 500, step: 25 },
      bandwidth: { min: 1, max: 10, step: 1 },
    },
    cloud: {
      cpu: { min: 1, max: 16, step: 1 },
      ram: { min: 2, max: 32, step: 2 },
      storage: { min: 50, max: 1000, step: 50 },
      bandwidth: { min: 2, max: 20, step: 2 },
    },
    shared: {
      cpu: { min: 0, max: 0, step: 1 },
      ram: { min: 0, max: 0, step: 1 },
      storage: { min: 0, max: 0, step: 1 },
      bandwidth: { min: 0, max: 0, step: 1 },
    }
  };

  const currentSpecs = specs[serviceType];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Configure Your {serviceType.toUpperCase()} Hosting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPU Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Cores
            </Label>
            <Badge variant="secondary">{config.cpu} cores</Badge>
          </div>
          <Slider
            value={[config.cpu]}
            onValueChange={(value) => setConfig({ ...config, cpu: value[0] })}
            min={currentSpecs.cpu.min}
            max={currentSpecs.cpu.max}
            step={currentSpecs.cpu.step}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            ${pricing[serviceType].cpu}/core/month
          </p>
        </div>

        {/* RAM Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              RAM
            </Label>
            <Badge variant="secondary">{config.ram} GB</Badge>
          </div>
          <Slider
            value={[config.ram]}
            onValueChange={(value) => setConfig({ ...config, ram: value[0] })}
            min={currentSpecs.ram.min}
            max={currentSpecs.ram.max}
            step={currentSpecs.ram.step}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            ${pricing[serviceType].ram}/GB/month
          </p>
        </div>

        {/* Storage Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage
            </Label>
            <Badge variant="secondary">{config.storage} GB</Badge>
          </div>
          <Slider
            value={[config.storage]}
            onValueChange={(value) => setConfig({ ...config, storage: value[0] })}
            min={currentSpecs.storage.min}
            max={currentSpecs.storage.max}
            step={currentSpecs.storage.step}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            ${pricing[serviceType].storage}/GB/month
          </p>
        </div>

        {/* Bandwidth Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Bandwidth
            </Label>
            <Badge variant="secondary">{config.bandwidth} TB</Badge>
          </div>
          <Slider
            value={[config.bandwidth]}
            onValueChange={(value) => setConfig({ ...config, bandwidth: value[0] })}
            min={currentSpecs.bandwidth.min}
            max={currentSpecs.bandwidth.max}
            step={currentSpecs.bandwidth.step}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            ${pricing[serviceType].bandwidth}/TB/month
          </p>
        </div>

        {/* Location Selection */}
        <div className="space-y-2">
          <Label>Data Center Location</Label>
          <Select value={config.location} onValueChange={(value) => setConfig({ ...config, location: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east">US East (Virginia)</SelectItem>
              <SelectItem value="us-west">US West (California)</SelectItem>
              <SelectItem value="eu-west">EU West (Ireland)</SelectItem>
              <SelectItem value="ap-south">Asia Pacific (Mumbai)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Setup Price</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-2xl font-bold">${calculatePrice().toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Renewal Price</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-2xl font-bold">${(calculatePrice() * 0.9).toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * 10% discount on renewals
            </p>
          </CardContent>
        </Card>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full btn-rocket"
          size="lg"
        >
          {loading ? 'Adding to Cart...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceConfigurator;