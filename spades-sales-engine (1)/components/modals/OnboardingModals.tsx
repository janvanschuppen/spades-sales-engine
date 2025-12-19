import React, { useState, useEffect } from 'react';
import { WebsiteData, ICP, UserProfile, FileMetadata, CoreProduct } from '../../types';
import { ContentModal } from '../ContentModal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mic, Upload, FileText, Globe } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileModalProps extends ModalProps {
  user: UserProfile | null;
  onSave: () => void;
}

interface ProductModalProps extends ModalProps {
  data: WebsiteData | null;
  coreProduct: CoreProduct | null;
  onSave: (updated: CoreProduct) => void;
}

interface ICPModalProps extends ModalProps {
  icp: ICP | null;
}

interface QAModalProps extends ModalProps {
  onComplete: () => void;
}

interface DocsModalProps extends ModalProps {
    files: FileMetadata[];
    userId: string;
    onUploadComplete: (newFiles: FileMetadata[]) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave }) => (
  <ContentModal
    isOpen={isOpen}
    onClose={onClose}
    title="User Profile"
    actionLabel="Save"
    onAction={() => { onSave(); onClose(); }}
  >
    <div className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
          <Input label="Name" defaultValue={user?.name} className="h-9 text-xs" />
          <Input label="Email" defaultValue={user?.email} disabled className="h-9 text-xs" />
       </div>
       <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400 capitalize">{user?.tier || 'Free'} Plan</span>
            <button className="text-[10px] text-blue-500 font-bold hover:underline">Manage Subscription</button>
       </div>
    </div>
  </ContentModal>
);

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, data, coreProduct, onSave }) => {
  const [offer, setOffer] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
        setOffer(coreProduct?.offer || data?.offerStructure || '');
        setDescription(coreProduct?.description || data?.positioning || '');
    }
  }, [isOpen, coreProduct, data]);

  const handleSave = () => {
      onSave({ description, offer, pricePoints: coreProduct?.pricePoints || [] });
      onClose();
  };

  return (
    <ContentModal
        isOpen={isOpen}
        onClose={onClose}
        title="Core Product"
        actionLabel="Save"
        onAction={handleSave}
    >
        <div className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Positioning</label>
             <textarea 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
             />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Offer</label>
             <textarea 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                rows={3}
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
             />
           </div>
        </div>
    </ContentModal>
  );
};

export const ICPModal: React.FC<ICPModalProps> = ({ isOpen, onClose, icp }) => (
  <ContentModal
    isOpen={isOpen}
    onClose={onClose}
    title="Target Profile"
  >
    <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
            <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Role</label>
            <div className="text-white text-sm font-medium mt-1">{icp?.title}</div>
            </div>
            <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Industries</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
                {icp?.industries.map((ind, i) => <span key={i} className="text-[9px] bg-blue-900/20 text-blue-400 border border-blue-900/50 px-1.5 py-0.5 rounded">{ind}</span>)}
            </div>
            </div>
        </div>
        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 h-full">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pain Points</label>
            <ul className="mt-1.5 space-y-1.5">
                {icp?.painPoints.slice(0, 4).map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 leading-tight">
                    <span className="text-red-500">•</span> {p}
                    </li>
                ))}
            </ul>
        </div>
    </div>
  </ContentModal>
);

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose, files, userId, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const file = e.target.files[0];
            try {
                const metadata = { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, uploadDate: new Date().toISOString() };
                await StorageService.addFile(userId, file, metadata);
                onUploadComplete([]); 
            } catch (error) {
                alert("Upload failed");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <ContentModal isOpen={isOpen} onClose={onClose} title="Training Docs">
          <div className="space-y-4">
             <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                 <div>
                    <h4 className="text-xs font-medium text-white">Add Document</h4>
                    <p className="text-[10px] text-zinc-500">PDF, TXT, DOCX</p>
                 </div>
                 <label className={`cursor-pointer bg-white text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                      {uploading ? '...' : 'Select'}
                      <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
                 </label>
             </div>
             <div className="space-y-1.5 max-h-[20vh] overflow-y-auto custom-scrollbar">
                {files.length === 0 ? (
                    <p className="text-center py-4 text-zinc-500 text-xs italic">No docs uploaded.</p>
                ) : (
                    files.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <div className="text-xs font-medium text-white truncate max-w-[150px]">{f.name}</div>
                            </div>
                            <span className="text-[10px] text-zinc-500">{(f.size / 1024).toFixed(0)} KB</span>
                        </div>
                    ))
                )}
             </div>
          </div>
        </ContentModal>
    );
};

export const QAModal: React.FC<QAModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [mode, setMode] = useState<'select' | 'form' | 'voice'>('select');
  const handleComplete = () => { onComplete(); onClose(); };

  return (
    <ContentModal isOpen={isOpen} onClose={onClose} title="Engine Tuning">
      {mode === 'select' && (
        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => setMode('form')} className="p-4 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all text-left group">
              <FileText className="w-5 h-5 text-zinc-500 mb-2" />
              <h3 className="text-xs font-bold text-white mb-1">Form</h3>
              <p className="text-[10px] text-zinc-500 leading-tight">Answer manually via standard inputs.</p>
           </button>
           <button onClick={() => setMode('voice')} className="p-4 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all text-left group">
              <Mic className="w-5 h-5 text-blue-400 mb-2" />
              <h3 className="text-xs font-bold text-white mb-1">Voice</h3>
              <p className="text-[10px] text-zinc-500 leading-tight">AI agent interview for faster setup.</p>
           </button>
        </div>
      )}
      {mode === 'form' && (
          <div className="space-y-3">
              <Input label="Primary Goal" placeholder="e.g. 20 leads/mo" className="h-8 text-xs" />
              <Input label="Competitor" placeholder="Main rival" className="h-8 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setMode('select')} className="text-[10px]">Back</Button>
                  <Button onClick={handleComplete} size="sm">Submit</Button>
              </div>
          </div>
      )}
      {mode === 'voice' && (
          <div className="flex flex-col items-center py-6 space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-zinc-500 text-xs italic">"Tell me about your primary sales goal."</p>
              <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setMode('select')} className="text-[10px]">Cancel</Button>
                  <Button onClick={handleComplete} variant="secondary" size="sm">Finish</Button>
              </div>
          </div>
      )}
    </ContentModal>
  );
};