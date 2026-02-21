import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function MaintenancePage() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ vehicle: '', type: 'Preventive', description: '', cost: '', performedBy: '' });

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/maintenance');
            setLogs(data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchVehicles = async () => {
        try { const { data } = await api.get('/vehicles'); setVehicles(data.data); } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchLogs(); fetchVehicles(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/maintenance', form);
            toast({ title: 'Created', description: 'Maintenance log added — vehicle set to In Shop', variant: 'success' });
            setDialogOpen(false); fetchLogs(); fetchVehicles();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.patch(`/maintenance/${id}/complete`);
            toast({ title: 'Completed', description: 'Maintenance done — vehicle set to Available', variant: 'success' });
            fetchLogs(); fetchVehicles();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this log?')) return;
        try { await api.delete(`/maintenance/${id}`); fetchLogs(); } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Maintenance Logs" description="Track preventive and reactive service events">
                <Button onClick={() => { setForm({ vehicle: '', type: 'Preventive', description: '', cost: '', performedBy: '' }); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Log Maintenance
                </Button>
            </PageHeader>
            <Card><CardContent className="p-0">
                {loading ? <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Vehicle</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                            <TableHead>Cost</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead>
                            <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {logs.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No logs</TableCell></TableRow> :
                                logs.map(l => (
                                    <TableRow key={l._id}>
                                        <TableCell className="font-medium">{l.vehicle?.name}<br /><span className="text-xs text-muted-foreground">{l.vehicle?.licensePlate}</span></TableCell>
                                        <TableCell><StatusBadge status={l.type} /></TableCell>
                                        <TableCell className="max-w-xs truncate">{l.description}</TableCell>
                                        <TableCell>{formatCurrency(l.cost)}</TableCell>
                                        <TableCell>{formatDate(l.startDate)}</TableCell>
                                        <TableCell>{l.endDate ? formatDate(l.endDate) : '—'}</TableCell>
                                        <TableCell><StatusBadge status={l.status} /></TableCell>
                                        <TableCell className="text-right space-x-1">
                                            {l.status === 'In Progress' && <Button variant="ghost" size="icon" onClick={() => handleComplete(l._id)} title="Complete"><CheckCircle className="h-4 w-4 text-emerald-400" /></Button>}
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(l._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>)}
            </CardContent></Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>Log Maintenance</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2"><Label>Vehicle</Label>
                        <Select value={form.vehicle} onValueChange={v => setForm({ ...form, vehicle: v })}>
                            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                            <SelectContent>{vehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name} ({v.licensePlate})</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Type</Label>
                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Preventive">Preventive</SelectItem><SelectItem value="Reactive">Reactive</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Performed By</Label><Input value={form.performedBy} onChange={e => setForm({ ...form, performedBy: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
                </form>
            </DialogContent></Dialog>
        </div>
    );
}
