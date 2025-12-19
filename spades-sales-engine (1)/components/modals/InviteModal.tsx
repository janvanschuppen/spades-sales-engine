import React, { useState } from 'react';
import { ContentModal } from '../ContentModal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post<{success: boolean, link: string}>('/invites/create', { email });
      setInviteLink(res.link);
    } catch (err: any) {
      setError(err.message || "Failed to create invite");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team"
      intro="Add members to collaborate."
    >
      <div className="space-y-4">
        {!inviteLink ? (
            <form onSubmit={handleCreateInvite} className="space-y-3">
                <Input 
                    label="Email" 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs"
                />
                <Button type="submit" isLoading={isLoading} className="w-full font-bold text-xs" size="sm">
                    <Mail className="w-3.5 h-3.5 mr-2" /> Send Invite
                </Button>
            </form>
        ) : (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] text-zinc-400">Invite sent to {email}.</span>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Manual Link</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-400 truncate font-mono">
                            {inviteLink}
                        </div>
                        <Button type="button" onClick={copyLink} variant="secondary" size="sm">
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </ContentModal>
  );
};