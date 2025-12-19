import React from 'react';
import { AppState } from '../types';
import { Button } from './ui/Button';
import { Settings, Shield, Terminal, Database, CreditCard } from 'lucide-react';

interface AdminPanelProps {
  state: AppState;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ state, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full overflow-y-auto p-6 animate-slide-in-right">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
           <div className="flex items-center gap-3">
             <div className="bg-red-500/10 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-red-500" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Admin Console</h2>
                <p className="text-xs text-red-500 font-mono">ROOT ACCESS • MODE: {state.mode.toUpperCase()}</p>
             </div>
           </div>
           <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="space-y-8">
            
            {/* System Status */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">System Status</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                     <div className="text-xs text-zinc-500 mb-1">API Latency</div>
                     <div className="text-xl font-mono text-green-500">42ms</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                     <div className="text-xs text-zinc-500 mb-1">Active Workers</div>
                     <div className="text-xl font-mono text-white">12</div>
                  </div>
               </div>
            </section>

            {/* Tool Integration Status */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Tool Integrity</h3>
               <div className="space-y-2">
                 {[
                   { name: 'Data Source API', status: 'Operational', ping: '120ms' },
                   { name: 'Voice Engine', status: 'Operational', ping: '85ms' },
                   { name: 'Video Renderer', status: 'Idle', ping: '-' },
                   { name: 'CRM Sync', status: 'Syncing', ping: '200ms' }
                 ].map(tool => (
                   <div key={tool.name} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded border border-zinc-800">
                      <span className="text-sm font-medium text-white">{tool.name}</span>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-mono text-zinc-500">{tool.ping}</span>
                         <span className="text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-900/50">{tool.status}</span>
                      </div>
                   </div>
                 ))}
               </div>
            </section>

             {/* Live Logs */}
             <section className="space-y-4">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                 <Terminal className="w-4 h-4" /> Live Logs
               </h3>
               <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto text-zinc-400 custom-scrollbar">
                  {state.logs.length > 0 ? state.logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-zinc-900/50 pb-1 last:border-0">
                      <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  )) : (
                    <div className="text-zinc-700 italic">No logs generated yet...</div>
                  )}
               </div>
            </section>

             {/* Dangerous Actions */}
             <section className="space-y-4 pt-4 border-t border-zinc-800">
               <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Override Controls</h3>
               <div className="flex gap-4">
                  <Button variant="danger" size="sm">Force Stop Engine</Button>
                  <Button variant="outline" size="sm">Reset State</Button>
               </div>
            </section>

        </div>
      </div>
    </div>
  );
};