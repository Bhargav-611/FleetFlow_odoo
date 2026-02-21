import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { roleLabels } from '@/lib/utils';
import {
    LayoutDashboard, Truck, Route, Wrench, Users, BarChart3,
    DollarSign, Menu, X, LogOut, ChevronLeft, Fuel,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
    { to: '/vehicles', label: 'Vehicles', icon: Truck, roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
    { to: '/trips', label: 'Trips', icon: Route, roles: ['fleet_manager', 'dispatcher'] },
    { to: '/drivers', label: 'Drivers', icon: Users, roles: ['fleet_manager', 'dispatcher', 'safety_officer'] },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['fleet_manager'] },
    { to: '/expenses', label: 'Expenses', icon: DollarSign, roles: ['fleet_manager', 'financial_analyst'] },
    { to: '/fuel-logs', label: 'Fuel Logs', icon: Fuel, roles: ['fleet_manager', 'dispatcher', 'financial_analyst'] },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['fleet_manager', 'financial_analyst'] },
];

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed z-50 inset-y-0 left-0 flex flex-col bg-card border-r transition-all duration-300 md:relative
          ${collapsed ? 'w-[68px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className={`flex items-center h-16 px-4 border-b ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        FF
                    </div>
                    {!collapsed && <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">FleetFlow</span>}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
                    {filteredNav.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
                  ${collapsed ? 'justify-center' : ''}
                `
                            }
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User info & collapse toggle */}
                <div className="border-t p-3 space-y-2">
                    {!collapsed && (
                        <div className="px-2 py-1">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{roleLabels[user?.role]}</p>
                        </div>
                    )}
                    <div className={`flex ${collapsed ? 'flex-col items-center gap-2' : 'gap-2'}`}>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="shrink-0" title="Logout">
                            <LogOut className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hidden md:flex shrink-0" title="Toggle sidebar">
                            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="flex items-center h-16 px-4 border-b bg-card/50 backdrop-blur-sm md:px-6">
                    <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setMobileOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
                    {children}
                </main>
            </div>

            <Toaster />
        </div>
    );
}
