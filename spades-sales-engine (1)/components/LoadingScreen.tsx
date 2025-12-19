import React, { useEffect, useState } from "react";

export default function LoadingScreen() {
  const steps = [
    "Extracting brand signals…",
    "Interpreting visual identity…",
    "Mapping target persona…",
    "Modeling market friction…",
    "Generating strategic messaging…",
    "Finalizing ICP intelligence…",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Fixed static path used to avoid module resolution errors in browser-native ESM
  const spadesLogo = "/static/branding/logo.png";

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, 2500);
    return () => clearInterval(stepTimer);
  }, [steps.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + (Math.random() * 3), 97));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      
      {/* PURPLE GLOW ORB */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-[#6C47FF]/25 blur-[140px] animate-orb" />

      {/* LOGO + GLOW */}
      <div className="relative mb-10 scale-[1.15] flex items-center justify-center min-h-[112px] min-w-[112px]">
        <div className="absolute inset-0 blur-2xl bg-[#6C47FF]/40 animate-liquid" />
        <img
          src={spadesLogo}
          alt="Spades Loading"
          className="relative w-28 h-28 animate-spin-slow drop-shadow-[0_0_25px_rgba(108,71,255,0.7)] object-contain brightness-200"
          onError={(e) => {
            const target = e.currentTarget;
            const parent = target.parentElement;
            if (parent) {
               const fallback = document.createElement('div');
               fallback.className = "text-[#6C47FF] text-7xl animate-spin-slow drop-shadow-[0_0_20px_#6C47FF] flex items-center justify-center h-28 w-28 select-none font-serif";
               fallback.innerText = "♠";
               parent.replaceChild(fallback, target);
            }
          }}
        />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-[#CFC8FF] drop-shadow animate-fade-in">
        Building Your ICP Engine…
      </h2>

      <p className="text-zinc-400 text-base mt-3 h-6 transition-opacity duration-300">
        {steps[stepIndex]}
      </p>

      <div className="w-96 h-2.5 bg-white/10 rounded-full mt-8 overflow-hidden relative border border-white/5">
        <div
          className="absolute inset-y-0 left-0 bg-[#6C47FF] animate-shimmer shadow-[0_0_15px_#6C47FF]"
          style={{ width: `${progress}%`, transition: 'width 0.6s ease-out' }}
        />
      </div>
    </div>
  );
}