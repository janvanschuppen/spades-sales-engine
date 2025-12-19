
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserProfile, UserMode } from '../types';
import { Button } from './ui/Button';
import { InviteModal } from './modals/InviteModal';
import { ContentModal } from './ContentModal';
import { Shield, Trash2, UserPlus, Clock, MoreHorizontal, CheckCircle2 } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
}

interface TeamInvite {
    id: string;
    email: string;
    role: string;
    created_at: string;
    expires_at: string;
}

interface TeamSettingsProps {
    currentUser: UserProfile;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({ currentUser }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invites, setInvites] = useState<TeamInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    
    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';
    const isOwner = currentUser.role === 'owner';

    const loadTeam = async () => {
        setLoading(true);
        try {
            const res = await api.get<{ members: TeamMember[], invites: TeamInvite[] }>('/team');
            setMembers(res.members);
            setInvites(res.invites);
        } catch (e: any) {
            setError(e.message || "Failed to load team.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeam();
    }, []);

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user? They will lose access immediately.')) return;
        try {
            await api.delete(`/team/member/${userId}`);
            loadTeam();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleRevokeInvite = async (inviteId: string) => {
        try {
            await api.delete(`/team/invite/${inviteId}`);
            loadTeam();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/team/member/${userId}/role`, { role: newRole });
            loadTeam();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const canRemove = (target: TeamMember) => {
        if (!canManage) return false;
        if (target.id === currentUser.id) return false; // Cannot delete self
        if (target.role === 'owner') return false; // No one deletes owner
        if (currentUser.role === 'admin' && target.role === 'admin') return false; // Admin cannot delete admin
        return true;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <InviteModal isOpen={showInviteModal} onClose={() => { setShowInviteModal(false); loadTeam(); }} />
            
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Team Management</h2>
                    <p className="text-sm text-zinc-400">Manage access and roles for your organization.</p>
                </div>
                {canManage && (
                    <Button onClick={() => setShowInviteModal(true)} className="gap-2">
                        <UserPlus className="w-4 h-4" /> Invite Member
                    </Button>
                )}
            </div>

            {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">{error}</div>}

            {/* Members List */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Joined</th>
                            {canManage && <th className="p-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {members.map(member => (
                            <tr key={member.id} className="hover:bg-zinc-900/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-white">{member.name}</div>
                                    <div className="text-xs text-zinc-500">{member.email}</div>
                                </td>
                                <td className="p-4">
                                    {isOwner && member.id !== currentUser.id ? (
                                        <select 
                                            value={member.role} 
                                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:border-blue-500 outline-none"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="member">Member</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                                            member.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            member.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                            {member.role}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-zinc-400 text-xs">
                                    {new Date(member.joinedAt).toLocaleDateString()}
                                </td>
                                {canManage && (
                                    <td className="p-4 text-right">
                                        {canRemove(member) && (
                                            <button 
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded transition-colors"
                                                title="Remove User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Invites List */}
            {canManage && invites.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Pending Invites
                    </h3>
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900 text-zinc-500 font-medium">
                                <tr>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Expires</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {invites.map(invite => (
                                    <tr key={invite.id} className="text-zinc-400">
                                        <td className="p-4 text-white">{invite.email}</td>
                                        <td className="p-4 capitalize">{invite.role}</td>
                                        <td className="p-4 text-xs">{new Date(invite.expires_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleRevokeInvite(invite.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                Revoke
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
