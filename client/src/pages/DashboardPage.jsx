import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { KPICard } from '@/components/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, AlertTriangle, Activity, Package, DollarSign, Fuel, Route as RouteIcon, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
    const [kpis, setKpis] = useState(null);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpiRes, trendRes] = await Promise.all([
                    api.get('/analytics/dashboard'),
                    api.get('/analytics/monthly-trends'),
                ]);
                setKpis(kpiRes.data.data);
                setTrends(trendRes.data.data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Command Center" description="Fleet operations overview" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-80 rounded-lg" />
                    <Skeleton className="h-80 rounded-lg" />
                </div>
            </div>
        );
    }

    const fleetPie = [
        { name: 'Available', value: kpis?.available || 0 },
        { name: 'On Trip', value: kpis?.activeFleet || 0 },
        { name: 'In Shop', value: kpis?.maintenanceAlerts || 0 },
        { name: 'Retired', value: kpis?.retired || 0 },
    ].filter(d => d.value > 0);

    const trendData = trends?.trips?.map(t => {
        const fuel = trends.fuel?.find(f => f._id === t._id);
        return {
            month: t._id,
            revenue: t.revenue,
            trips: t.trips,
            distance: t.distance,
            fuelCost: fuel?.fuelCost || 0,
        };
    }) || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Command Center" description="Real-time fleet operations overview" />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Active Fleet" value={kpis?.activeFleet || 0} icon={Truck} description="Vehicles currently on trip" />
                <KPICard title="Maintenance Alerts" value={kpis?.maintenanceAlerts || 0} icon={AlertTriangle} description="Vehicles in shop" />
                <KPICard title="Utilization Rate" value={`${kpis?.utilizationRate || 0}%`} icon={Activity} description="Active vs operational fleet" />
                <KPICard title="Pending Cargo" value={kpis?.pendingCargo || 0} icon={Package} description="Unassigned draft shipments" />
            </div>

            {/* Secondary KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Revenue" value={formatCurrency(kpis?.totalRevenue)} icon={DollarSign} />
                <KPICard title="Fuel Costs" value={formatCurrency(kpis?.totalFuelCost)} icon={Fuel} />
                <KPICard title="Total Distance" value={`${formatNumber(kpis?.totalDistance)} km`} icon={RouteIcon} />
                <KPICard title="Total Drivers" value={kpis?.totalDrivers || 0} icon={Users} />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Fleet Status Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Fleet Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={fleetPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {fleetPie.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue & Fuel Cost Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                                <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="fuelCost" name="Fuel Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
