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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const emptyVehicle = { name: '', licensePlate: '', type: 'Truck', maxCapacity: '', odometer: '', region: '', acquisitionCost: '', fuelType: 'Diesel' };

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyVehicle);

    const fetchVehicles = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            const { data } = await api.get('/vehicles', { params });
            setVehicles(data.data);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to load vehicles', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, [search, statusFilter]);

    const openCreate = () => { setEditing(null); setForm(emptyVehicle); setDialogOpen(true); };
    const openEdit = (v) => { setEditing(v); setForm({ ...v }); setDialogOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/vehicles/${editing._id}`, form);
                toast({ title: 'Updated', description: `${form.name} has been updated`, variant: 'success' });
            } else {
                await api.post('/vehicles', form);
                toast({ title: 'Created', description: `${form.name} has been added`, variant: 'success' });
            }
            setDialogOpen(false);
            fetchVehicles();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Operation failed', variant: 'destructive' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            toast({ title: 'Deleted', description: 'Vehicle has been removed', variant: 'success' });
            fetchVehicles();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', variant: 'destructive' });
        }
    };

    const toggleStatus = async (v, newStatus) => {
        try {
            await api.patch(`/vehicles/${v._id}/status`, { status: newStatus });
            toast({ title: 'Status Updated', description: `${v.name} is now ${newStatus}` });
            fetchVehicles();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Update failed', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Vehicle Registry" description="Manage your fleet assets">
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Vehicle</Button>
            </PageHeader>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vehicles..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="On Trip">On Trip</SelectItem>
                        <SelectItem value="In Shop">In Shop</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name / Model</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Odometer</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No vehicles found</TableCell></TableRow>
                                ) : vehicles.map(v => (
                                    <TableRow key={v._id}>
                                        <TableCell className="font-medium">{v.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{v.licensePlate}</TableCell>
                                        <TableCell>{v.type}</TableCell>
                                        <TableCell>{formatNumber(v.maxCapacity)} kg</TableCell>
                                        <TableCell>{formatNumber(v.odometer)} km</TableCell>
                                        <TableCell>{v.region}</TableCell>
                                        <TableCell><StatusBadge status={v.status} /></TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                                            {v.status === 'Available' && (
                                                <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleStatus(v, 'Retired')}>Retire</Button>
                                            )}
                                            {v.status === 'Retired' && (
                                                <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleStatus(v, 'Available')}>Activate</Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(v._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name / Model</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>License Plate</Label>
                                <Input value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['Truck', 'Van', 'Trailer', 'Tanker', 'Flatbed', 'Refrigerated', 'Other'].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Capacity (kg)</Label>
                                <Input type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Odometer (km)</Label>
                                <Input type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Region</Label>
                                <Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Acquisition Cost ($)</Label>
                                <Input type="number" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fuel Type</Label>
                                <Select value={form.fuelType} onValueChange={v => setForm({ ...form, fuelType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid'].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
