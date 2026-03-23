"use client";

import React from "react";
import { NoiseBackground } from "./noise-background";

interface NoiseCTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  gradientColors?: string[];
}

export function NoiseCTAButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  gradientColors = [
    "rgb(200, 200, 220)",
    "rgb(160, 160, 190)",
    "rgb(220, 220, 240)",
  ],
}: NoiseCTAButtonProps) {
  return (
    <NoiseBackground
      containerClassName="rounded-xl overflow-hidden"
      gradientColors={gradientColors}
      noiseIntensity={0.15}
      speed={0.08}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`relative w-full cursor-pointer rounded-xl bg-linear-to-r from-[#0e0e11] via-[#0e0e11] to-[#141417] px-6 py-3 text-text-primary font-semibold text-[13px] shadow-[0px_1px_0px_0px_var(--color-surface-highest)_inset,0px_1px_0px_0px_var(--color-border)] transition-all duration-100 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </button>
    </NoiseBackground>
  );
}
