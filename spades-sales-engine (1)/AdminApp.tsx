
import React, { useState, useEffect } from 'react';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminService } from './services/admin';

export const AdminApp: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Check path for explicit login page
    if (window.location.pathname === '/admin/login') {
        setIsAdmin(false);
        return;
    }

    // Otherwise verify session
    AdminService.checkSession().then((session) => {
       if (session && session.role === 'admin') {
           setIsAdmin(true);
       } else {
           setIsAdmin(false);
           if (window.location.pathname !== '/admin/login') {
              window.history.replaceState({}, '', '/admin/login');
           }
       }
    });
  }, []);

  if (isAdmin === null) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Verifying access...</div>;
  }

  if (!isAdmin) {
      return <AdminLogin />;
  }

  return <AdminDashboard />;
};
