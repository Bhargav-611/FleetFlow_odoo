import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
    }).format(amount || 0);
}

export function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num || 0);
}

export const statusColors = {
    Available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'On Trip': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'In Shop': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Retired: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    'On Duty': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Off Duty': 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    'On Trip': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Suspended: 'bg-red-500/15 text-red-400 border-red-500/30',
    Draft: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    Dispatched: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    'In Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Preventive: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Reactive: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

export const roleLabels = {
    driver: 'Driver',
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
};
