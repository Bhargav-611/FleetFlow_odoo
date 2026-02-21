import { Badge } from '@/components/ui/badge';
import { cn, statusColors } from '@/lib/utils';

export function StatusBadge({ status }) {
    return (
        <Badge variant="outline" className={cn('font-medium', statusColors[status] || 'bg-muted text-muted-foreground')}>
            {status}
        </Badge>
    );
}
