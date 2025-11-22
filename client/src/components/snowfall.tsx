import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  size: number;
}

export default function Snowfall() {
  const [location] = useLocation();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  // Only show snowfall on main customer pages (not login/register)
  const showSnowfall = !location.includes("/login") && !location.includes("/register");

  useEffect(() => {
    if (!showSnowfall) return;
    
    // Create 30 snowflakes
    const flakes: Snowflake[] = [];
    for (let i = 0; i < 30; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 15, // 15-30 seconds
        opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7 opacity
        size: 6 + Math.random() * 8, // 6-14px size
      });
    }
    setSnowflakes(flakes);
  }, [showSnowfall]);

  if (!showSnowfall) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall pointer-events-none"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: flake.opacity,
          }}
        >
          <svg
            width={flake.size}
            height={flake.size}
            viewBox="0 0 24 24"
            className="text-primary dark:text-card opacity-60"
            style={{ pointerEvents: 'none' }}
          >
            <path
              d="M12 2L12 22M12 2L8 6M12 2L16 6M12 22L8 18M12 22L16 18M2 12L22 12M2 12L6 8M2 12L6 16M22 12L18 8M22 12L18 16M6.34 6.34L17.66 17.66M6.34 6.34L10.34 6.34M6.34 6.34L6.34 10.34M17.66 17.66L13.66 17.66M17.66 17.66L17.66 13.66M6.34 17.66L17.66 6.34M6.34 17.66L6.34 13.66M6.34 17.66L10.34 17.66M17.66 6.34L17.66 10.34M17.66 6.34L13.66 6.34"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
