import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Download, Fuel, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function AnalyticsPage() {
    const [efficiency, setEfficiency] = useState([]);
    const [roi, setRoi] = useState([]);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [effRes, roiRes, trendRes] = await Promise.all([
                    api.get('/analytics/fuel-efficiency'),
                    api.get('/analytics/vehicle-roi'),
                    api.get('/analytics/monthly-trends'),
                ]);
                setEfficiency(effRes.data.data);
                setRoi(roiRes.data.data);
                setTrends(trendRes.data.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const exportCSV = async (type) => {
        try {
            const { data } = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([data]));
            const a = document.createElement('a'); a.href = url; a.download = `${type}_report.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            toast({ title: 'Downloaded', description: `${type} report exported` });
        } catch (err) { toast({ title: 'Error', description: 'Export failed', variant: 'destructive' }); }
    };

    if (loading) return (
        <div className="space-y-6">
            <PageHeader title="Analytics" />
            <div className="grid gap-4 md:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
            <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
        </div>
    );

    const avgEfficiency = efficiency.length ? (efficiency.reduce((s, e) => s + (e.kmPerLiter || 0), 0) / efficiency.length).toFixed(1) : 0;
    const avgCostPerKm = efficiency.length ? (efficiency.reduce((s, e) => s + (e.costPerKm || 0), 0) / efficiency.length).toFixed(2) : 0;
    const totalROI = roi.reduce((s, r) => s + (r.roi || 0), 0);
    const avgROI = roi.length ? (totalROI / roi.length).toFixed(1) : 0;

    const trendData = trends?.trips?.map(t => {
        const fuel = trends.fuel?.find(f => f._id === t._id);
        return { month: t._id, revenue: t.revenue || 0, trips: t.trips, fuelCost: fuel?.fuelCost || 0 };
    }) || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Analytics & Reports" description="Financial performance and fleet efficiency">
                <Button variant="outline" onClick={() => exportCSV('vehicles')}><Download className="h-4 w-4 mr-2" /> Vehicles CSV</Button>
                <Button variant="outline" onClick={() => exportCSV('trips')}><Download className="h-4 w-4 mr-2" /> Trips CSV</Button>
                <Button variant="outline" onClick={() => exportCSV('expenses')}><Download className="h-4 w-4 mr-2" /> Expenses CSV</Button>
            </PageHeader>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard title="Avg Fuel Efficiency" value={`${avgEfficiency} km/L`} icon={Fuel} />
                <KPICard title="Avg Cost/km" value={`$${avgCostPerKm}`} icon={DollarSign} />
                <KPICard title="Avg Vehicle ROI" value={`${avgROI}%`} icon={TrendingUp} />
                <KPICard title="Vehicles Analyzed" value={efficiency.length} icon={Calculator} />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-lg">Fuel Efficiency by Vehicle</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={efficiency.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                                <XAxis dataKey="vehicle" stroke="hsl(215,20%,55%)" fontSize={11} angle={-20} textAnchor="end" height={60} />
                                <YAxis stroke="hsl(215,20%,55%)" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8 }} />
                                <Bar dataKey="kmPerLiter" name="km/L" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card><CardHeader><CardTitle className="text-lg">Monthly Revenue vs Cost</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" />
                                <XAxis dataKey="month" stroke="hsl(215,20%,55%)" fontSize={12} />
                                <YAxis stroke="hsl(215,20%,55%)" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8 }} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="fuelCost" name="Fuel Cost" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* ROI Table */}
            <Card><CardHeader><CardTitle className="text-lg">Vehicle ROI Analysis</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Vehicle</TableHead><TableHead>Revenue</TableHead><TableHead>Fuel Cost</TableHead>
                            <TableHead>Maint. Cost</TableHead><TableHead>Acq. Cost</TableHead><TableHead>ROI %</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {roi.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No ROI data</TableCell></TableRow> :
                                roi.map(r => (
                                    <TableRow key={r.vehicleId}>
                                        <TableCell className="font-medium">{r.vehicle}</TableCell>
                                        <TableCell>{formatCurrency(r.revenue)}</TableCell>
                                        <TableCell>{formatCurrency(r.fuelCost)}</TableCell>
                                        <TableCell>{formatCurrency(r.maintenanceCost)}</TableCell>
                                        <TableCell>{formatCurrency(r.acquisitionCost)}</TableCell>
                                        <TableCell className={r.roi >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{r.roi?.toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
