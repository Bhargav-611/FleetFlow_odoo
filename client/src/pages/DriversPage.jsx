import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
import { Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const emptyDriver = { name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', vehicleCategories: [], status: 'On Duty' };

export default function DriversPage() {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyDriver);

    const isManager = ['fleet_manager', 'dispatcher', 'safety_officer'].includes(user?.role);
    const isDriver = user?.role === 'driver';

    const fetchDrivers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            const { data } = await api.get('/drivers', { params });
            setDrivers(data.data);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to load drivers', variant: 'destructive' });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchDrivers(); }, [search, statusFilter]);

    const openCreate = () => { setEditing(null); setForm(emptyDriver); setDialogOpen(true); };
    const openEdit = (d) => {
        setEditing(d);
        setForm({ ...d, licenseExpiry: d.licenseExpiry ? new Date(d.licenseExpiry).toISOString().split('T')[0] : '' });
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/drivers/${editing._id}`, form);
                toast({ title: 'Updated', description: `${form.name} updated` });
            } else {
                await api.post('/drivers', form);
                toast({ title: 'Created', description: `${form.name} added` });
            }
            setDialogOpen(false); fetchDrivers();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const toggleStatus = async (d, newStatus) => {
        try {
            await api.patch(`/drivers/${d._id}/status`, { status: newStatus });
            toast({ title: 'Status Updated', description: `${d.name} is now ${newStatus}` });
            fetchDrivers();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this driver?')) return;
        try { await api.delete(`/drivers/${id}`); fetchDrivers(); } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
        }
    };

    const isExpired = (date) => new Date(date) <= new Date();

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Driver Profiles" description={isDriver ? "View your driver profile" : "Manage driver compliance and performance"}>
                {isManager && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>}
            </PageHeader>
            {isManager && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search drivers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="On Duty">On Duty</SelectItem>
                            <SelectItem value="Off Duty">Off Duty</SelectItem>
                            <SelectItem value="On Trip">On Trip</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <Card><CardContent className="p-0">
                {loading ? <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Name</TableHead><TableHead>License</TableHead><TableHead>Expiry</TableHead>
                            <TableHead>Categories</TableHead><TableHead>Safety</TableHead><TableHead>Trips</TableHead>
                            <TableHead>Status</TableHead>{isManager && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow></TableHeader>
                        <TableBody>
                            {drivers.length === 0 ? <TableRow><TableCell colSpan={isManager ? 8 : 7} className="text-center py-8 text-muted-foreground">No drivers</TableCell></TableRow> :
                                drivers.map(d => (
                                    <TableRow key={d._id}>
                                        <TableCell className="font-medium">{d.name}<br /><span className="text-xs text-muted-foreground">{d.phone}</span></TableCell>
                                        <TableCell className="font-mono text-xs">{d.licenseNumber}</TableCell>
                                        <TableCell>
                                            <span className={isExpired(d.licenseExpiry) ? 'text-red-400 flex items-center gap-1' : ''}>
                                                {isExpired(d.licenseExpiry) && <AlertTriangle className="h-3 w-3" />}{formatDate(d.licenseExpiry)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs">{d.vehicleCategories?.join(', ')}</TableCell>
                                        <TableCell><span className={d.safetyScore >= 80 ? 'text-emerald-400' : d.safetyScore >= 60 ? 'text-amber-400' : 'text-red-400'}>{d.safetyScore}</span></TableCell>
                                        <TableCell>{d.completedTrips}/{d.totalTrips} ({d.completionRate}%)</TableCell>
                                        <TableCell><StatusBadge status={d.status} /></TableCell>
                                        {isManager && (
                                            <TableCell className="text-right space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                                                {d.status === 'On Duty' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleStatus(d, 'Off Duty')}>Off Duty</Button>}
                                                {d.status === 'Off Duty' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleStatus(d, 'On Duty')}>On Duty</Button>}
                                                {d.status !== 'Suspended' && d.status !== 'On Trip' && <Button variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => toggleStatus(d, 'Suspended')}>Suspend</Button>}
                                                {d.status === 'Suspended' && <Button variant="ghost" size="sm" className="text-xs text-emerald-400" onClick={() => toggleStatus(d, 'On Duty')}>Reinstate</Button>}
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(d._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>)}
            </CardContent></Card>

            {isManager && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Driver</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                            <div className="space-y-2"><Label>License Number</Label><Input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>License Expiry</Label><Input type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Safety Score</Label><Input type="number" min="0" max="100" value={form.safetyScore || ''} onChange={e => setForm({ ...form, safetyScore: e.target.value })} /></div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Create'}</Button></DialogFooter>
                    </form>
                </DialogContent></Dialog>
            )}
        </div>
    );
}
