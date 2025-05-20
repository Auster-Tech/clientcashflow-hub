
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsTrendProps {
  value: string | number;
  label?: string;
  positive?: boolean;
  isPositive?: boolean;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: StatsTrendProps;
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  // Handle both number and string values for trend.isPositive
  const isPositive = 
    trend?.positive !== undefined ? trend.positive : 
    trend?.isPositive !== undefined ? trend.isPositive : 
    true;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">
            <Icon className="h-full w-full" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <div className="flex items-center pt-1">
              <span
                className={cn(
                  "text-xs font-medium mr-1",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.value}
              </span>
              {trend.label && <span className="text-xs text-muted-foreground">{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
