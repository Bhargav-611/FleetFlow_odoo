import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (!result.success) setError(result.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5" />

            <Card className="w-full max-w-md relative animate-fade-in border-border/50 shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 animate-pulse-glow">
                        <Truck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            FleetFlow
                        </CardTitle>
                        <CardDescription className="mt-1">Fleet & Logistics Management System</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="manager@fleetflow.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 space-y-2">
                        <p className="text-xs text-muted-foreground text-center">Demo Credentials</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                { role: 'Fleet Manager', email: 'manager@fleetflow.com' },
                                { role: 'Dispatcher', email: 'dispatcher@fleetflow.com' },
                                { role: 'Safety Officer', email: 'safety@fleetflow.com' },
                                { role: 'Analyst', email: 'analyst@fleetflow.com' },
                            ].map(cred => (
                                <button
                                    key={cred.email}
                                    type="button"
                                    onClick={() => { setEmail(cred.email); setPassword('password123'); }}
                                    className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <p className="font-medium text-foreground">{cred.role}</p>
                                    <p className="text-muted-foreground truncate">{cred.email}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <a href="/register" className="text-primary hover:underline">
                                Sign Up
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
