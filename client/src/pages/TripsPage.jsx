import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Plus, Play, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function TripsPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [completeOpen, setCompleteOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [availVehicles, setAvailVehicles] = useState([]);
    const [availDrivers, setAvailDrivers] = useState([]);
    const [form, setForm] = useState({
        vehicle: '', driver: '', origin: '', destination: '',
        cargoWeight: '', cargoDescription: '', revenue: '',
    });
    const [completeForm, setCompleteForm] = useState({ endOdometer: '', revenue: '' });

    const fetchTrips = async () => {
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const { data } = await api.get('/trips', { params });
            setTrips(data.data);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to load trips', variant: 'destructive' });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchTrips(); }, [statusFilter, search]);

    const openCreate = async () => {
        try {
            const [vRes, dRes] = await Promise.all([
                api.get('/vehicles/available'), api.get('/drivers/available'),
            ]);
            setAvailVehicles(vRes.data.data);
            setAvailDrivers(dRes.data.data);
            setForm({ vehicle: '', driver: '', origin: '', destination: '', cargoWeight: '', cargoDescription: '', revenue: '' });
            setDialogOpen(true);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to load resources', variant: 'destructive' });
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', form);
            toast({ title: 'Trip Created', description: 'New trip added as Draft', variant: 'success' });
            setDialogOpen(false); fetchTrips();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Create failed', variant: 'destructive' });
        }
    };

    const handleDispatch = async (id) => {
        try {
            await api.patch(`/trips/${id}/dispatch`);
            toast({ title: 'Dispatched', description: 'Vehicle & driver are now On Trip', variant: 'success' });
            fetchTrips();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const openComplete = (trip) => {
        setSelectedTrip(trip);
        setCompleteForm({ endOdometer: '', revenue: trip.revenue || '' });
        setCompleteOpen(true);
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/trips/${selectedTrip._id}/complete`, completeForm);
            toast({ title: 'Completed', description: 'Trip completed — resources returned to available', variant: 'success' });
            setCompleteOpen(false); fetchTrips();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this trip?')) return;
        try {
            await api.patch(`/trips/${id}/cancel`);
            toast({ title: 'Cancelled', description: 'Trip has been cancelled' });
            fetchTrips();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            toast({ title: 'Deleted' }); fetchTrips();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Trip Dispatcher" description="Create, dispatch, and manage trips">
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Trip</Button>
            </PageHeader>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card><CardContent className="p-0">
                {loading ? (
                    <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                ) : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Vehicle</TableHead><TableHead>Driver</TableHead><TableHead>Route</TableHead>
                            <TableHead>Cargo</TableHead><TableHead>Revenue</TableHead><TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {trips.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No trips</TableCell></TableRow>
                            ) : trips.map(t => (
                                <TableRow key={t._id}>
                                    <TableCell className="font-medium">{t.vehicle?.name || 'N/A'}</TableCell>
                                    <TableCell>{t.driver?.name || 'N/A'}</TableCell>
                                    <TableCell>{t.origin} → {t.destination}</TableCell>
                                    <TableCell>{formatNumber(t.cargoWeight)} kg</TableCell>
                                    <TableCell>${formatNumber(t.revenue)}</TableCell>
                                    <TableCell><StatusBadge status={t.status} /></TableCell>
                                    <TableCell className="text-right space-x-1">
                                        {t.status === 'Draft' && <Button variant="ghost" size="icon" onClick={() => handleDispatch(t._id)} title="Dispatch"><Play className="h-4 w-4 text-blue-400" /></Button>}
                                        {t.status === 'Dispatched' && <Button variant="ghost" size="icon" onClick={() => openComplete(t)} title="Complete"><CheckCircle className="h-4 w-4 text-emerald-400" /></Button>}
                                        {(t.status === 'Draft' || t.status === 'Dispatched') && <Button variant="ghost" size="icon" onClick={() => handleCancel(t._id)} title="Cancel"><XCircle className="h-4 w-4 text-amber-400" /></Button>}
                                        {(t.status === 'Draft' || t.status === 'Completed' || t.status === 'Cancelled') && <Button variant="ghost" size="icon" onClick={() => handleDelete(t._id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent></Card>

            {/* Create Trip Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Create New Trip</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Vehicle</Label>
                                <Select value={form.vehicle} onValueChange={v => setForm({ ...form, vehicle: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{availVehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name} — {formatNumber(v.maxCapacity)}kg</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Driver</Label>
                                <Select value={form.driver} onValueChange={v => setForm({ ...form, driver: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{availDrivers.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Origin</Label><Input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Destination</Label><Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Cargo (kg)</Label><Input type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Revenue ($)</Label><Input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><Label>Cargo Description</Label><Input value={form.cargoDescription} onChange={e => setForm({ ...form, cargoDescription: e.target.value })} /></div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Complete Trip Dialog */}
            <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Complete Trip</DialogTitle></DialogHeader>
                    <form onSubmit={handleComplete} className="space-y-4">
                        <div className="space-y-2"><Label>Final Odometer</Label><Input type="number" value={completeForm.endOdometer} onChange={e => setCompleteForm({ ...completeForm, endOdometer: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Revenue ($)</Label><Input type="number" value={completeForm.revenue} onChange={e => setCompleteForm({ ...completeForm, revenue: e.target.value })} /></div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setCompleteOpen(false)}>Cancel</Button><Button type="submit">Mark Completed</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
