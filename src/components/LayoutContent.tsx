'use client';

import Link from "next/link";
import { Activity, LayoutDashboard, Wifi, Shield, FileText, Menu, X, Search, Moon, Sun, Bell, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname, useRouter } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Don't show layout on login page or portals
    if (pathname === '/' || pathname === '/faculty' || pathname === '/student') return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-background text-text-primary font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col
                    ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'}
                `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-border">
                    <Link href="/admin" className="flex items-center gap-3 overflow-hidden px-4 w-full">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className={`font-bold text-lg tracking-tight transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            SanchaarGrid
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <NavItem href="/admin" icon={<LayoutDashboard />} label="Dashboard" active={pathname === '/admin'} collapsed={!sidebarOpen} />
                    <NavItem href="/admin/devices" icon={<Wifi />} label="Devices" active={pathname === '/admin/devices'} collapsed={!sidebarOpen} />
                    <NavItem href="/admin/policy" icon={<Shield />} label="Policy" active={pathname === '/admin/policy'} collapsed={!sidebarOpen} />
                    <NavItem href="/admin/audit" icon={<FileText />} label="Audit Logs" active={pathname === '/admin/audit'} collapsed={!sidebarOpen} />
                </nav>

                {/* Footer Actions */}
                <div className="p-3 border-t border-border space-y-1">
                    <button
                        onClick={toggleTheme}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors ${!sidebarOpen && 'justify-center'}`}
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {sidebarOpen && <span className="text-sm font-medium">Theme</span>}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-danger transition-colors ${!sidebarOpen && 'justify-center'}`}
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[72px]'}
                `}
            >
                {/* Top Header */}
                <header className="h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Search (Hidden on mobile) */}
                        <div className="hidden md:flex items-center relative">
                            <Search className="absolute left-3 w-4 h-4 text-text-tertiary" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-1.5 bg-surface-hover border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-full text-text-secondary hover:bg-surface-hover relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-info flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-surface">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active, collapsed }: { href: string; icon: React.ReactNode; label: string; active?: boolean; collapsed?: boolean }) {
    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }
                ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? label : undefined}
        >
            <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`}>
                {/* Clone element to enforce size if needed, or rely on parent class */}
                <div className="w-5 h-5">{icon}</div>
            </span>

            {!collapsed && (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {label}
                </span>
            )}

            {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
            )}
        </Link>
    );
}


