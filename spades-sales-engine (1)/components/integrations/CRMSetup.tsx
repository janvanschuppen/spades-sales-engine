import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckCircle2, ShieldCheck, AlertCircle, ExternalLink, RefreshCw, Key } from 'lucide-react';

export const CRMSetup: React.FC = () => {
    const [status, setStatus] = useState<{ connected: boolean; last_updated?: string } | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ valid: boolean; user?: string } | null>(null);
    const [error, setError] = useState('');

    const loadStatus = async () => {
        try {
            const data = await api.get<any>('/integrations/close/status');
            setStatus(data);
            if (data.connected) setStep(3);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleTest = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post<any>('/integrations/close/test', { api_key: apiKey });
            setTestResult(res);
            if (res.valid) setStep(2);
        } catch (e: any) {
            setError(e.message || "Test connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/integrations/close/save', { api_key: apiKey });
            setStep(3);
            loadStatus();
        } catch (e: any) {
            setError(e.message || "Failed to save credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 py-4 animate-fade-in">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    Close CRM Integration
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    Connect your CRM to automate lead delivery. Credentials are encrypted using AES-256-GCM and stored only in our secure backend vault.
                </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                
                {/* Status Bar */}
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${status?.connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Status: {status?.connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    {status?.connected && (
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3" /> 
                            Updated {new Date(status.last_updated!).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="p-8 space-y-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Input 
                                    label="Close API Key" 
                                    type="password" 
                                    placeholder="api_..." 
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                                    <p className="text-[10px] text-zinc-400">
                                        Find your key in <a href="https://app.close.com/settings/api/" target="_blank" className="text-blue-400 hover:underline inline-flex items-center gap-1">Settings > API Keys <ExternalLink className="w-2.5 h-2.5" /></a>
                                    </p>
                                </div>
                            </div>

                            {testResult?.valid === false && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> The API key provided is invalid.
                                </div>
                            )}

                            <Button onClick={handleTest} isLoading={loading} className="w-full" disabled={!apiKey}>
                                Test Connection
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center space-y-3">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Successfully Verified</h4>
                                    <p className="text-xs text-zinc-400">Authenticated as: <span className="text-white font-medium">{testResult?.user}</span></p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <Button onClick={handleSave} isLoading={loading} className="w-full">
                                    Save & Link Credentials
                                </Button>
                                <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
                                    Back
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                                    <Key className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">Encrypted Link Active</h4>
                                    <p className="text-xs text-zinc-500">Your engine is now synced with Close CRM.</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase tracking-wider">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Synced
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800">
                                <Button variant="outline" size="sm" onClick={() => { setApiKey(''); setStep(1); }} className="w-full text-zinc-500">
                                    Update Credentials
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                 <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Security Protocol</h4>
                 <ul className="space-y-2">
                    {[
                        "All CRM tokens are encrypted with AES-256-GCM using a server-side secret.",
                        "Plaintext keys are never stored, logged, or returned to the client.",
                        "Access to the integration layer is restricted by organization ID.",
                        "Proxied requests are filtered for PII and sanitized before execution."
                    ].map((item, i) => (
                        <li key={i} className="text-[10px] text-zinc-500 flex gap-2">
                            <span className="text-blue-500">•</span> {item}
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};