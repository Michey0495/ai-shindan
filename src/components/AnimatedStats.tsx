"use client";

import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: number;
}

interface AnimatedStatsProps {
  stats: Stat[];
  barColor?: string;
  accentText?: string;
}

export function AnimatedStats({
  stats,
  barColor = "bg-purple-400",
  accentText = "text-purple-400",
}: AnimatedStatsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3">
      {stats.map((stat, i) => (
        <div key={i}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/70 text-sm">{stat.label}</span>
            <span className={`${accentText} text-sm font-bold`}>
              {stat.value}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`${barColor} h-2 rounded-full transition-all duration-700 ease-out`}
              style={{
                width: animated ? `${stat.value}%` : "0%",
                transitionDelay: `${i * 100 + 200}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
