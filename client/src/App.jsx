import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Trip Management Styles
import '@/styles/trips.css';

import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import VehiclesPage from '@/pages/VehiclesPage';
import TripsPage from '@/pages/TripsPage';
import DriversPage from '@/pages/DriversPage';
import MaintenancePage from '@/pages/MaintenancePage';
import ExpensesPage from '@/pages/ExpensesPage';
import FuelLogsPage from '@/pages/FuelLogsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';

function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
    return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
            <Route path="/trips/*" element={<ProtectedRoute roles={['fleet_manager', 'dispatcher']}><TripsPage /></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute roles={['fleet_manager', 'dispatcher', 'safety_officer', 'driver']}><DriversPage /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute roles={['fleet_manager']}><MaintenancePage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute roles={['fleet_manager', 'financial_analyst']}><ExpensesPage /></ProtectedRoute>} />
            <Route path="/fuel-logs" element={<ProtectedRoute roles={['fleet_manager', 'dispatcher', 'financial_analyst']}><FuelLogsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute roles={['fleet_manager', 'financial_analyst']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}
