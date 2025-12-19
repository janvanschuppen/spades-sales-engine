
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ShieldAlert, Lock } from 'lucide-react';
import { AdminService } from '../../services/admin';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await AdminService.login(email, password);
      // Force reload to trigger AdminApp session check and routing
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError('Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
       <div className="w-full max-w-sm bg-black border border-zinc-800 p-8 rounded-xl shadow-2xl">
          <div className="flex justify-center mb-6">
             <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
                <ShieldAlert className="w-8 h-8 text-red-500" />
             </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-1">System Administration</h2>
          <p className="text-xs text-zinc-500 text-center mb-8">Restricted Access. All activity is logged.</p>

          <form onSubmit={handleLogin} className="space-y-4">
             <Input 
                type="email" 
                placeholder="admin@spades.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
             />
             <Input 
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
             />

             {error && (
               <div className="bg-red-900/20 border border-red-900/50 p-2 rounded text-xs text-red-400 text-center">
                 {error}
               </div>
             )}

             <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-0" isLoading={isLoading}>
                Authenticate
             </Button>
          </form>
          
          <div className="mt-6 flex justify-center text-[10px] text-zinc-600 gap-1 uppercase font-bold tracking-widest">
             <Lock className="w-3 h-3" /> Secure Environment
          </div>
       </div>
    </div>
  );
};
