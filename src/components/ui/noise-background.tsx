"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface NoiseBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientColors?: string[];
  noiseIntensity?: number;
  speed?: number;
  backdropBlur?: boolean;
  animating?: boolean;
}

export function NoiseBackground({
  children,
  className = "",
  containerClassName = "",
  gradientColors = [
    "rgb(255, 100, 150)",
    "rgb(100, 150, 255)",
    "rgb(255, 200, 100)",
  ],
  noiseIntensity = 0.2,
  speed = 0.1,
  backdropBlur = false,
  animating = true,
}: NoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw animated gradient blobs
    const t = timeRef.current;
    gradientColors.forEach((color, i) => {
      const offset = (i / gradientColors.length) * Math.PI * 2;
      const x = width * 0.5 + Math.cos(t * speed + offset) * width * 0.3;
      const y = height * 0.5 + Math.sin(t * speed * 1.3 + offset) * height * 0.3;
      const radius = Math.max(width, height) * 0.5;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });

    // Noise overlay
    if (noiseIntensity > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 255 * noiseIntensity;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    if (animating) {
      timeRef.current += 0.016;
      animationRef.current = requestAnimationFrame(render);
    }
  }, [gradientColors, noiseIntensity, speed, animating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d");
        ctx?.scale(dpr, dpr);
      }
    });

    resizeObserver.observe(canvas.parentElement!);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.8 }}
      />
      {backdropBlur && (
        <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />
      )}
      <div className={`relative z-10 ${className}`}>{children}</div>
    </div>
  );
}
