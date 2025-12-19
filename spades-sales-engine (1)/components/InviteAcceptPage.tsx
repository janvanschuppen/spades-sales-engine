
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AuthService } from '../services/auth';

interface InviteAcceptPageProps {
    token: string;
}

export const InviteAcceptPage: React.FC<InviteAcceptPageProps> = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [error, setError] = useState('');
    
    // Form
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const validate = async () => {
            try {
                const res = await api.get<{valid: boolean, email: string, organizationName: string, role: string}>(`/invites/validate/${token}`);
                if (res.valid) {
                    setValid(true);
                    setInviteData(res);
                } else {
                    setValid(false);
                    setError("This invite is invalid, expired, or has already been used.");
                }
            } catch (e) {
                setValid(false);
                setError("Unable to validate invite.");
            } finally {
                setLoading(false);
            }
        };
        validate();
    }, [token]);

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await api.post('/invites/accept', { token, name, password });
            // Redirect to dashboard (auth cookie is set)
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || "Failed to accept invite.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Validating Invite...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-slide-up">
                
                <div className="text-center mb-8">
                    <img 
                        src="/static/branding/logo.png" 
                        onError={(e) => { e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; }}
                        alt="Spades" 
                        className="h-6 mx-auto mb-6 opacity-80" 
                    />
                    
                    {valid ? (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">Join {inviteData.organizationName}</h1>
                            <p className="text-zinc-400 text-sm">You have been invited to join the team as a <span className="text-white font-medium capitalize">{inviteData.role}</span>.</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h1 className="text-xl font-bold text-white mb-2">Invalid Invite</h1>
                        </>
                    )}
                </div>

                {valid ? (
                    <form onSubmit={handleAccept} className="space-y-4">
                        <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 text-center mb-6">
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Invited Email</p>
                            <p className="text-white font-medium">{inviteData.email}</p>
                        </div>

                        <Input 
                            label="Full Name" 
                            placeholder="John Doe" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Create Password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full mt-4" size="lg" isLoading={submitting}>
                            Join Team <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-zinc-500 text-sm mb-6">{error}</p>
                        <Button onClick={() => window.location.href = '/'} variant="outline">
                            Back to Home
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
