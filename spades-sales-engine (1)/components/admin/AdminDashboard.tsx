
import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin';
import { Button } from '../ui/Button';
import { Activity, Users, Server, LogOut, Shield, Search, AlertTriangle, CheckCircle, Ban, Power } from 'lucide-react';
import { UserDetailsModal } from './UserDetailsModal';

type AdminView = 'dashboard' | 'users' | 'activity';

/**
 * Safely stringifies a metadata object for display.
 */
function displayMetadata(metadata: any): string {
    if (!metadata) return '{}';
    try {
        const cache = new Set();
        return JSON.stringify(metadata, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return '[Circular]';
                cache.add(value);
            }
            return value;
        }, 2);
    } catch (e) {
        return '[Non-serializable data]';
    }
}

export const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<AdminView>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    // Poll for updates every 30s
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
     try {
         const [u, s, a] = await Promise.all([
             AdminService.getUsers(),
             AdminService.getSystemStatus(),
             AdminService.getActivity()
         ]);
         setUsers(u);
         setSystemStatus(s);
         setActivityLogs(a);
     } catch (e) {
         console.error("Admin data load failed", e);
     }
  };

  const handleLogout = () => {
      AdminService.logout();
  };

  const openUserDetails = async (userId: string) => {
      try {
          const details = await AdminService.getUserDetails(userId);
          setSelectedUser(details);
          setIsModalOpen(true);
      } catch (e) {
          alert('Failed to load user details');
      }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
      if (!confirm(`Are you sure you want to ${currentStatus ? 'DISABLE' : 'ENABLE'} this user?`)) return;
      
      try {
          if (currentStatus) {
              await AdminService.disableUser(userId);
          } else {
              await AdminService.enableUser(userId);
          }
          loadData(); // Refresh list
      } catch (e) {
          alert('Action failed');
      }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex font-sans">
      
      <UserDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
      />

      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-zinc-900 flex flex-col fixed h-full">
        <div className="p-6 border-b border-zinc-900">
           <div className="flex items-center gap-2 text-white font-bold tracking-tight">
             <Shield className="w-5 h-5 text-red-600" />
             SPADES ADMIN
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
           <button 
             onClick={() => setView('dashboard')}
             className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'dashboard' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
           >
              <Server className="w-4 h-4" /> System Overview
           </button>
           <button 
             onClick={() => setView('users')}
             className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'users' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
           >
              <Users className="w-4 h-4" /> User Management
           </button>
           <button 
             onClick={() => setView('activity')}
             className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'activity' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
           >
              <Activity className="w-4 h-4" /> Audit Logs
           </button>
        </nav>

        <div className="p-4 border-t border-zinc-900">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-950/30 rounded-lg transition-colors"
           >
             <LogOut className="w-3.5 h-3.5" /> Secure Logout
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-y-auto">
         <div className="p-8">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
               <h1 className="text-2xl font-bold text-white capitalize">{view === 'dashboard' ? 'System Overview' : view}</h1>
               <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  System Operational • {new Date().toLocaleTimeString()}
               </div>
            </div>

            {view === 'dashboard' && systemStatus && (
               <div className="space-y-6">
                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                        <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total Users</div>
                        <div className="text-3xl font-bold text-white">{systemStatus.users}</div>
                     </div>
                     <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                         <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Active Sessions</div>
                        <div className="text-3xl font-bold text-blue-500">{systemStatus.activeSessions}</div>
                     </div>
                     <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                         <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Logs (24h)</div>
                        <div className="text-3xl font-bold text-orange-500">{systemStatus.logs24h}</div>
                     </div>
                     <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                         <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Uptime</div>
                        <div className="text-3xl font-bold text-green-500">{(systemStatus.uptime / 3600).toFixed(1)}h</div>
                     </div>
                  </div>

                  {/* Recent Logs Preview */}
                  <div className="bg-black border border-zinc-900 rounded-xl p-6">
                     <h3 className="text-sm font-bold text-white mb-4">Recent Activity</h3>
                     <div className="space-y-2 font-mono text-xs text-zinc-500">
                        {activityLogs.slice(0, 5).map((log: any) => (
                             <div key={log.id} className="flex gap-4 border-b border-zinc-900 pb-2 mb-2 last:border-0">
                                 <span className="text-zinc-700 w-32 shrink-0">{new Date(log.created_at).toLocaleString()}</span> 
                                 <span className="text-blue-500 w-32 shrink-0">[{log.action}]</span> 
                                 <span className="text-zinc-400 truncate">User {log.user_id} • {displayMetadata(log.metadata)}</span>
                             </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {view === 'users' && (
               <div className="space-y-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 flex gap-2">
                     <Search className="w-5 h-5 text-zinc-500 ml-2 mt-2" />
                     <input type="text" placeholder="Search users by email..." className="bg-transparent border-none text-white text-sm w-full focus:outline-none p-2" />
                  </div>
                  
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900 text-zinc-500 font-medium">
                           <tr>
                              <th className="p-4">User / Email</th>
                              <th className="p-4">Company</th>
                              <th className="p-4">Plan</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                           {users.map((u: any) => (
                              <tr key={u.id} className="hover:bg-zinc-900/50">
                                 <td className="p-4">
                                    <div className="font-medium text-white">{u.first_name} {u.last_name}</div>
                                    <div className="text-xs text-zinc-500">{u.email}</div>
                                 </td>
                                 <td className="p-4 text-zinc-400">{u.company_name || '-'}</td>
                                 <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-xs border ${u.tier === 'full' ? 'bg-purple-900/20 border-purple-900/50 text-purple-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                       {u.tier || 'Free'}
                                    </span>
                                 </td>
                                 <td className="p-4">
                                     <div className="space-y-1">
                                         {u.active ? (
                                             <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold"><Power className="w-3 h-3" /> ACTIVE</span>
                                         ) : (
                                             <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold"><Ban className="w-3 h-3" /> DISABLED</span>
                                         )}
                                         
                                         {u.is_verified ? (
                                             <span className="flex items-center gap-1.5 text-zinc-500 text-[10px]"><CheckCircle className="w-2.5 h-2.5" /> Verified</span>
                                         ) : (
                                             <span className="flex items-center gap-1.5 text-yellow-600 text-[10px]"><AlertTriangle className="w-2.5 h-2.5" /> Pending</span>
                                         )}
                                     </div>
                                 </td>
                                 <td className="p-4 text-right space-x-2">
                                    {u.active ? (
                                        <button 
                                            onClick={() => handleToggleStatus(u.id, true)}
                                            className="px-3 py-1 text-xs border border-red-900 text-red-500 hover:bg-red-900/20 rounded"
                                        >
                                            Disable
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleToggleStatus(u.id, false)}
                                            className="px-3 py-1 text-xs border border-green-900 text-green-500 hover:bg-green-900/20 rounded"
                                        >
                                            Enable
                                        </button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => openUserDetails(u.id)}>Details</Button>
                                 </td>
                              </tr>
                           ))}
                           {users.length === 0 && (
                              <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No users found</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {view === 'activity' && (
                <div className="space-y-4">
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-zinc-900 text-zinc-500">
                                <tr>
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">User ID</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">IP Address</th>
                                    <th className="p-4">Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {activityLogs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-zinc-900/50 text-zinc-400">
                                        <td className="p-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="p-4 text-blue-400">{log.user_id}</td>
                                        <td className="p-4 text-white font-bold">{log.action}</td>
                                        <td className="p-4">{log.ip_address}</td>
                                        <td className="p-4 text-zinc-500 max-w-md truncate" title={displayMetadata(log.metadata)}>
                                            {displayMetadata(log.metadata)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

         </div>
      </div>
    </div>
  );
};
