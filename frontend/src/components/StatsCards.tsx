import { Card, CardContent } from '@/components/ui/card';
import { Package, Factory, FlaskConical, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

function StatCard({ title, value, subtitle, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <Card 
      className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <TrendingUp 
                className={`w-4 h-4 ${trend.isPositive ? 'text-accent' : 'text-destructive rotate-180'}`} 
              />
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-accent' : 'text-destructive'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const stats = [
    {
      title: 'Products',
      value: 5000,
      subtitle: 'Active pharmaceutical products',
      icon: <Package className="w-5 h-5" />,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: 'Manufacturers',
      value: 121,
      subtitle: 'Verified manufacturers',
      icon: <Factory className="w-5 h-5" />,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: 'Chemistries',
      value: 25,
      subtitle: 'Unique chemical compounds',
      icon: <FlaskConical className="w-5 h-5" />,
      trend: { value: 15.8, isPositive: true },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 100} />
      ))}
    </div>
  );
}

