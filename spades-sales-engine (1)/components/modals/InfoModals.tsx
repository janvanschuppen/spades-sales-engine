import React from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import { ContentModal } from '../ContentModal';

// --- Concept Modal ---
interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({ isOpen, onClose, onAction }) => (
  <ContentModal
    isOpen={isOpen}
    onClose={onClose}
    title="The Concept"
    intro="An automated sales infrastructure that replaces the need for scattered tools and manual teams."
    actionLabel="Register"
    onAction={onAction}
    headerImage="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2600&auto=format&fit=crop"
  >
    <div className="space-y-4">
      {[
        { step: 1, title: "Analysis", text: "The engine scans your platform to understand exactly what you sell." },
        { step: 2, title: "Targeting", text: "We construct a verified list of high-intent decision makers globally." },
        { step: 3, title: "Engagement", text: "AI agents initiate conversations via personalized emails and voice." },
        { step: 4, title: "Revenue", text: "The system only notifies you when a deal is ready to close." }
      ].map((item) => (
        <div key={item.step} className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px]">
            {item.step}
          </span>
          <div>
            <h4 className="text-white font-semibold text-sm mb-0.5">{item.title}</h4>
            <p className="text-xs leading-relaxed">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  </ContentModal>
);

// --- About Modal ---
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => (
  <ContentModal
    isOpen={isOpen}
    onClose={onClose}
    title="About"
    headerImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2600&auto=format&fit=crop"
  >
    <div className="space-y-4 text-sm">
      <div className="space-y-3">
        {[
          "Built on decades of enterprise B2B sales and training operations.",
          "Fragmented tools were replaced with one coordinated engine.",
          "Every prospect is guided through a consistent path to decision.",
          "You focus on closing. The engine handles everything before that."
        ].map((item, i) => (
          <div key={i} className="flex gap-3">
             <div className="mt-1.5 w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
             <span className="text-zinc-400 leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </ContentModal>
);

// --- Startups Info Modal ---
interface StartupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

export const StartupsModal: React.FC<StartupsModalProps> = ({ isOpen, onClose, onAction }) => (
  <ContentModal
    isOpen={isOpen}
    onClose={onClose}
    title="Startups"
    intro="Exclusive rates for high-potential startups. We invest in your growth."
    actionLabel="Startup Pricing"
    onAction={onAction}
    headerImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2600&auto=format&fit=crop"
  >
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
           <div className="flex items-center gap-2 mb-1">
             <Rocket className="w-3 h-3 text-orange-500" />
             <h4 className="font-semibold text-white text-xs">Growth</h4>
           </div>
           <p className="text-[10px] text-zinc-500 leading-tight">Automate early with enterprise-grade tech.</p>
        </div>
         <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
           <div className="flex items-center gap-2 mb-1">
             <Sparkles className="w-3 h-3 text-orange-500" />
             <h4 className="font-semibold text-white text-xs">Equity</h4>
           </div>
           <p className="text-[10px] text-zinc-500 leading-tight">Preserve cash while scaling your outbound.</p>
        </div>
      </div>

      <p className="text-[10px] text-zinc-600 italic leading-tight">
        Access requires qualification and review. Not all applicants are accepted.
      </p>
    </div>
  </ContentModal>
);