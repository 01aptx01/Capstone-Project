"use client";

import React, { useLayoutEffect, useRef } from "react";

interface AuthCardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

// Shell dimensions defined as JS constants — applied as inline styles
// so they are guaranteed to be in the HTML before any stylesheet loads.
const SHELL_STYLE: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  borderRadius: "1.5rem",
  padding: "2.5rem",
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.18)",
  opacity: 0,
  transform: "translateY(10px) scale(0.985)",
  transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
};

export default function AuthCardWrapper({ children, className = "" }: AuthCardWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  // useLayoutEffect fires synchronously after DOM mutations, BEFORE the browser paints.
  // This eliminates any frame where the card is visible in its initial opacity:0 state
  // while also preventing the "half-rendered" flash.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // rAF defers until the browser is ready to paint — guarantees layout is complete
    const frame = requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0) scale(1)";
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={ref} style={SHELL_STYLE} className={className}>
      {children}
    </div>
  );
}

