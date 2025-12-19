import React from 'react';
import { ICPAnalysisResult } from '../../types';

interface CompanyHeaderProps {
  data: Partial<ICPAnalysisResult>;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ data }) => {
  const {
    companyName = "Company Profile",
    industry,
    primaryColor = "#3b82f6",
    logoUrl,
    heroImage,
  } = data || {};

  // Safe fallback images
  const safeLogo =
    logoUrl && logoUrl.length > 5
      ? logoUrl
      : "https://cdn-icons-png.flaticon.com/512/5968/5968764.png";

  const safeHero =
    heroImage && heroImage.length > 5
      ? heroImage
      : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="w-full relative mb-16 md:mb-20">
      {/* HERO IMAGE */}
      <div
        className="w-full h-48 md:h-64 rounded-xl bg-cover bg-center shadow-md overflow-hidden relative"
        style={{ backgroundImage: `url(${safeHero})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div 
          className="absolute inset-0 opacity-30" 
          style={{ background: `linear-gradient(135deg, ${primaryColor}44 0%, transparent 100%)` }}
        />
      </div>

      {/* LOGO + COMPANY INFO */}
      <div className="absolute -bottom-10 left-6 md:left-10 flex items-end gap-5">
        {/* LOGO FRAME */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl" />
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 shadow-2xl overflow-hidden bg-white p-2 flex items-center justify-center transition-transform group-hover:scale-[1.02]" style={{ borderColor: primaryColor }}>
            <img
              src={safeLogo}
              alt={`${companyName} logo`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* TEXT */}
        <div className="mb-1 md:mb-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl tracking-tight">
            {companyName}
          </h1>

          {industry && (
            <span
              className="inline-block mt-2 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl"
            >
              {industry}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};