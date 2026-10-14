import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Layout = () => {
    const { pathname } = useLocation();
    // The admin dashboard shows its own minimal copyright line instead of the full footer
    const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/admin/');
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            {!isAdminDashboard && <Footer />}
        </div>
    );
};

export default Layout;
