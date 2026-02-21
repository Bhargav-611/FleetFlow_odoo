import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function KPICard({ title, value, icon: Icon, description, trend, className }) {
    return (
        <Card className={cn('animate-fade-in hover:shadow-lg transition-shadow duration-300', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                    {Icon && (
                        <div className="rounded-xl bg-primary/10 p-3">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                    )}
                </div>
                {trend !== undefined && (
                    <div className={cn('mt-3 text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
