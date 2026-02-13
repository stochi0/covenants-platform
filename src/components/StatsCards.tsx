import { Card, CardContent } from '@/components/ui/card';
import { Package, Factory, FlaskConical } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon, delay = 0 }: StatCardProps) {
  return (
    <Card 
      className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-border/50 bg-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-tight">{value.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 flex-shrink-0">
            {icon}
          </div>
        </div>
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
      icon: <Package className="w-4 h-4" />,
    },
    {
      title: 'Manufacturers',
      value: 121,
      subtitle: 'Verified manufacturers',
      icon: <Factory className="w-4 h-4" />,
    },
    {
      title: 'Chemistries',
      value: 25,
      subtitle: 'Unique chemical processes',
      icon: <FlaskConical className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 100} />
      ))}
    </div>
  );
}

