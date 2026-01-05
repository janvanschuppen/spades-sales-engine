import React from "react";

interface CompanyHeaderProps {
  data: any;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ data }) => {
  /**
   * ABSOLUTE HARD RULES — READ CAREFULLY
   *
   * 1. We ONLY render a logo if the backend provides a REAL URL
   * 2. That URL must point to an EXISTING, PRE-DESIGNED, SQUARE BRAND ICON
   *    (usually a social media profile image: LinkedIn, X, YouTube, etc.)
   * 3. We DO NOT:
   *    - generate logos
   *    - resize logos
   *    - reshape logos
   *    - infer logos
   *    - fall back to defaults
   * 4. If no valid logo URL exists → the logo space is LEFT EMPTY
   */

  const logoUrl =
    typeof data?.company?.logoUrl === "string" &&
    data.company.logoUrl.trim() !== ""
      ? data.company.logoUrl
      : null;

  const brandColor = data?.company?.brandColor || "#6C47FF";
  const companyName = data?.company?.name || "Company";

  return (
    <div className="relative rounded-3xl overflow-hidden bg-black">
      {/* HERO BACKDROP (NO LOGO INVOLVEMENT) */}
      <div className="h-[260px] w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-end">
        <div className="p-8 flex items-center gap-6">
          
          {/* 
            LOGO SLOT — CONDITIONAL
            Renders ONLY if a real square brand icon URL exists
          */}
          {logoUrl && (
            <div
              className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center overflow-hidden"
              style={{ border: `3px solid ${brandColor}` }}
            >
              <img
                src={logoUrl}
                alt={`${companyName} brand icon`}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* COMPANY NAME */}
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {companyName}
          </h1>
        </div>
      </div>
    </div>
  );
};
