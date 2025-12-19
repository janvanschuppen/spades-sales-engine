
import React from 'react';
import { X, FileText, Database, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const { profile, data, files } = user;
  const icp = data?.icp || {};
  const web = data?.website_data || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-start bg-zinc-900/50">
           <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 {profile.first_name} {profile.last_name}
                 <span className={`text-[10px] px-2 py-0.5 rounded border ${profile.active ? 'bg-green-900/20 text-green-500 border-green-900/50' : 'bg-red-900/20 text-red-500 border-red-900/50'}`}>
                    {profile.active ? 'ACTIVE' : 'DISABLED'}
                 </span>
              </h2>
              <p className="text-sm text-zinc-500">{profile.email} • {profile.company_name}</p>
           </div>
           <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 1. Overview Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-500 uppercase font-bold">Tier</div>
                    <div className="text-lg text-white capitalize">{profile.tier || 'Free'}</div>
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-500 uppercase font-bold">Joined</div>
                    <div className="text-sm text-white">{new Date(profile.created_at).toLocaleDateString()}</div>
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                     <div className="text-xs text-zinc-500 uppercase font-bold">Verification</div>
                     <div className="text-sm text-white">{profile.is_verified ? 'Verified' : 'Pending'}</div>
                </div>
            </div>

            {/* 2. Tenant Data */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4" /> System Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ICP */}
                    <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg">
                        <div className="text-xs text-blue-500 font-bold mb-2">GENERATED ICP</div>
                        {icp.title ? (
                            <div className="space-y-2">
                                <p className="text-sm text-white font-medium">{icp.title}</p>
                                <p className="text-xs text-zinc-400">{icp.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {icp.industries?.map((i: string) => <span key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300">{i}</span>)}
                                </div>
                            </div>
                        ) : <span className="text-sm text-zinc-600 italic">No ICP generated yet.</span>}
                    </div>

                    {/* Website Analysis */}
                    <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg">
                        <div className="text-xs text-blue-500 font-bold mb-2">WEBSITE ANALYSIS</div>
                        {web.url ? (
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-300 truncate"><span className="text-zinc-500">URL:</span> {web.url}</p>
                                <p className="text-xs text-zinc-300"><span className="text-zinc-500">Pos:</span> {web.positioning}</p>
                                <p className="text-xs text-zinc-300"><span className="text-zinc-500">Offer:</span> {web.offerStructure}</p>
                            </div>
                        ) : <span className="text-sm text-zinc-600 italic">No analysis data.</span>}
                    </div>
                </div>
            </div>

            {/* 3. Files */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Stored Files ({files?.length || 0})
                </h3>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden">
                    {files && files.length > 0 ? (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-900 text-zinc-500">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Size</th>
                                    <th className="p-3">Uploaded</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {files.map((f: any) => (
                                    <tr key={f.id} className="text-zinc-300">
                                        <td className="p-3">{f.name}</td>
                                        <td className="p-3">{(f.size / 1024).toFixed(0)} KB</td>
                                        <td className="p-3">{new Date(f.upload_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-4 text-center text-sm text-zinc-600 italic">No files uploaded.</div>
                    )}
                </div>
            </div>

        </div>

        <div className="p-4 bg-zinc-900/50 border-t border-zinc-900 flex justify-end">
            <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

      </div>
    </div>
  );
};
