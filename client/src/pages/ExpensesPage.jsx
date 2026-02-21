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
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ vehicle: '', category: 'Fuel', amount: '', description: '', date: '' });

    const fetchData = async () => {
        try {
            const [eRes, vRes] = await Promise.all([api.get('/expenses'), api.get('/vehicles')]);
            setExpenses(eRes.data.data); setVehicles(vRes.data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', form);
            toast({ title: 'Created', description: 'Expense recorded', variant: 'success' });
            setDialogOpen(false); fetchData();
        } catch (err) { toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete?')) return;
        try { await api.delete(`/expenses/${id}`); fetchData(); } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Expenses" description="Track operational costs">
                <Button onClick={() => { setForm({ vehicle: '', category: 'Fuel', amount: '', description: '', date: '' }); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Expense
                </Button>
            </PageHeader>
            <Card><CardContent className="p-0">
                {loading ? <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Vehicle</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No expenses</TableCell></TableRow> :
                                expenses.map(e => (
                                    <TableRow key={e._id}>
                                        <TableCell className="font-medium">{e.vehicle?.name}</TableCell>
                                        <TableCell>{e.category}</TableCell>
                                        <TableCell>{formatCurrency(e.amount)}</TableCell>
                                        <TableCell>{formatDate(e.date)}</TableCell>
                                        <TableCell className="max-w-xs truncate">{e.description}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(e._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>)}
            </CardContent></Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2"><Label>Vehicle</Label>
                        <Select value={form.vehicle} onValueChange={v => setForm({ ...form, vehicle: v })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{vehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name} ({v.licensePlate})</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Category</Label>
                            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{['Fuel', 'Maintenance', 'Toll', 'Insurance', 'Fine', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
                </form>
            </DialogContent></Dialog>
        </div>
    );
}
