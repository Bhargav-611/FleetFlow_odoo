import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';

export default function FuelLogsPage() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ vehicle: '', liters: '', cost: '', odometerAtFill: '', date: '' });

    const fetchData = async () => {
        try {
            const [fRes, vRes] = await Promise.all([api.get('/fuel-logs'), api.get('/vehicles')]);
            setLogs(fRes.data.data); setVehicles(vRes.data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/fuel-logs', form);
            toast({ title: 'Created', description: 'Fuel log recorded', variant: 'success' });
            setDialogOpen(false); fetchData();
        } catch (err) { toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete?')) return;
        try { await api.delete(`/fuel-logs/${id}`); fetchData(); } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Fuel Logs" description="Track fuel consumption and costs">
                <Button onClick={() => { setForm({ vehicle: '', liters: '', cost: '', odometerAtFill: '', date: '' }); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Fuel Log
                </Button>
            </PageHeader>
            <Card><CardContent className="p-0">
                {loading ? <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Vehicle</TableHead><TableHead>Liters</TableHead><TableHead>Cost</TableHead>
                            <TableHead>Odometer</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {logs.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No fuel logs</TableCell></TableRow> :
                                logs.map(l => (
                                    <TableRow key={l._id}>
                                        <TableCell className="font-medium">{l.vehicle?.name}<br /><span className="text-xs text-muted-foreground">{l.vehicle?.licensePlate}</span></TableCell>
                                        <TableCell>{formatNumber(l.liters)} L</TableCell>
                                        <TableCell>{formatCurrency(l.cost)}</TableCell>
                                        <TableCell>{formatNumber(l.odometerAtFill)} km</TableCell>
                                        <TableCell>{formatDate(l.date)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(l._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>)}
            </CardContent></Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>Add Fuel Log</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2"><Label>Vehicle</Label>
                        <Select value={form.vehicle} onValueChange={v => setForm({ ...form, vehicle: v })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{vehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name} ({v.licensePlate})</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Liters</Label><Input type="number" step="0.01" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} required /></div>
                        <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} required /></div>
                        <div className="space-y-2"><Label>Odometer</Label><Input type="number" value={form.odometerAtFill} onChange={e => setForm({ ...form, odometerAtFill: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
                </form>
            </DialogContent></Dialog>
        </div>
    );
}
