import React from "react";

interface CompanyHeaderProps {
  data: any;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ data }) => {
  /**
   * ============================================
   * BRAND ICON RULES — READ BEFORE TOUCHING THIS
   * ============================================
   *
   * We do NOT render a "logo".
   *
   * We ONLY render a pre-existing, square BRAND ICON
   * that already exists on the internet.
   *
   * ACCEPTED SOURCES (STRICT):
   * - LinkedIn company profile photo
   * - X (Twitter) profile photo
   * - YouTube channel profile photo
   *
   * REQUIRED PROPERTIES:
   * - Square (1:1)
   * - Brand mark ONLY (symbol/icon)
   * - Professionally designed
   * - Retrieved as-is from the source
   *
   * ABSOLUTELY NO:
   * - Wordmarks
   * - Full horizontal logos
   * - Cropping
   * - Reshaping
   * - Generating
   * - Guessing
   * - Local fallback assets
   *
   * If no valid brand icon URL exists,
   * the icon area is intentionally LEFT EMPTY.
   */

  const brandIconUrl =
    typeof data?.company?.brandIconUrl === "string" &&
    data.company.brandIconUrl.trim() !== ""
      ? data.company.brandIconUrl
      : null;

  const brandColor = data?.company?.brandColor || "#6C47FF";
  const companyName = data?.company?.name || "Company";

  return (
    <div className="relative rounded-3xl overflow-hidden bg-black">
      {/* HERO BACKGROUND */}
      <div className="h-[260px] w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-end">
        <div className="p-8 flex items-center gap-6">

          {/* BRAND ICON (ONLY IF IT ALREADY EXISTS) */}
          {brandIconUrl && (
            <div
              className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center overflow-hidden"
              style={{ border: `3px solid ${brandColor}` }}
            >
              <img
                src={brandIconUrl}
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
