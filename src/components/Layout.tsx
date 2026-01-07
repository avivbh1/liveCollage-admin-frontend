import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { LogOut, Calendar } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header style={{
                background: 'var(--admin-surface)',
                borderBottom: '1px solid var(--admin-border)',
                padding: '0.75rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div className="container flex items-center justify-between">
                    <Link to="/events" className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                        <Calendar size={24} />
                        <span>LiveCollage</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
                            {user?.name} ({user?.email})
                        </span>
                        <button
                            onClick={logout}
                            className="btn btn-outline"
                            style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem', gap: '0.4rem' }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1" style={{ padding: '2rem 0' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
