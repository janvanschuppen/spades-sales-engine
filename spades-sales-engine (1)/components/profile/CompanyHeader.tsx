import React from "react";

interface CompanyHeaderProps {
  data: any;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ data }) => {
  const logo =
    data?.company?.logoUrl && data.company.logoUrl !== "/logo.png"
      ? data.company.logoUrl
      : "/logo.png";

  const brandColor = data?.company?.brandColor || "#6C47FF";
  const companyName = data?.company?.name || "Company";

  return (
    <div className="relative rounded-3xl overflow-hidden bg-black">
      {/* HERO IMAGE */}
      <div className="h-[260px] w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-end">
        <div className="p-8 flex items-center gap-6">
          {/* LOGO (1:1 ONLY) */}
          <div
            className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center overflow-hidden"
            style={{ border: `3px solid ${brandColor}` }}
          >
            <img
              src={logo}
              alt={`${companyName} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>

          {/* NAME */}
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {companyName}
          </h1>
        </div>
      </div>
    </div>
  );
};
