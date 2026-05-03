"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: string;
  valueColor?: string;
  href?: string;
}

export default function DashboardCard({ 
  title, 
  value, 
  subValue, 
  icon, 
  trend, 
  trendDirection = "neutral", 
  accentColor = "var(--card-accent)",
  valueColor = "#334155",
  href
}: DashboardCardProps) {
  const trendBg = trendDirection === "up" ? "#ECFDF5" : trendDirection === "down" ? "#FEF2F2" : "#FFF7ED";
  const trendColor = trendDirection === "up" ? "#065F46" : trendDirection === "down" ? "#991B1B" : "#C2410C";
  const trendIcon = trendDirection === "up" ? "↗" : trendDirection === "down" ? "↘" : "";

  // Mouse spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      250px circle at ${mouseX}px ${mouseY}px,
      rgba(244, 123, 42, 0.05),
      transparent 80%
    )
  `;

  const card = (
    <motion.div 
      onMouseMove={handleMouseMove}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="vibrant-card p-6 h-full flex flex-col justify-between relative overflow-hidden group"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="flex items-center relative z-10">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
            style={{ backgroundColor: accentColor }}
          >
            {icon}
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#64748B] mb-1 group-hover:text-[#f47b2a] transition-colors">{title}</div>
            <div className="text-[26px] font-extrabold leading-none flex items-baseline gap-2" style={{ color: valueColor }}>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="leading-none value-number"
              >
                {value}
              </motion.span>
              {subValue && (
                <span className="text-[14px] font-medium text-[#94A3B8]">{subValue}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {trend && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold z-10 shadow-sm"
          style={{ backgroundColor: trendBg, color: trendColor }}
        >
          {trendIcon} {trend}
        </motion.div>
      )}
      
      {/* Subtle background glow on hover */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#f47b2a]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}

