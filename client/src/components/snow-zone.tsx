import { ReactNode, useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  size: number;
}

interface SnowZoneProps {
  children: ReactNode;
  variant: "primary" | "surface"; // primary = green bg (cream flakes), surface = cream bg (green flakes)
  className?: string;
}

export default function SnowZone({ children, variant, className = "" }: SnowZoneProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Create 8-12 snowflakes per section (lighter density for performance)
    const flakes: Snowflake[] = [];
    const count = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < count; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 15, // 15-30 seconds
        opacity: 0.25 + Math.random() * 0.35, // 0.25-0.6 opacity
        size: 6 + Math.random() * 6, // 6-12px size
      });
    }
    setSnowflakes(flakes);
  }, []);

  // Set color based on variant
  const snowflakeColor = variant === "primary" 
    ? "hsl(var(--card))" // Cream on green backgrounds
    : "hsl(var(--primary))"; // Green on cream backgrounds

  return (
    <div className={`relative ${className}`}>
      {/* Snowfall overlay for this section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
              viewBox="0 0 32 32"
              style={{ 
                pointerEvents: 'none',
                color: snowflakeColor
              }}
              fill="currentColor"
            >
              {/* Classic 6-pointed snowflake */}
              <circle cx="16" cy="16" r="1.5" />
              
              {/* 6 main branches */}
              <rect x="15" y="4" width="2" height="10" rx="1" />
              <rect x="15" y="18" width="2" height="10" rx="1" />
              <rect x="4" y="15" width="10" height="2" ry="1" />
              <rect x="18" y="15" width="10" height="2" ry="1" />
              <rect x="9" y="9" width="2" height="8" rx="1" transform="rotate(45 10 13)" />
              <rect x="21" y="9" width="2" height="8" rx="1" transform="rotate(-45 22 13)" />
              
              {/* Small decorative tips */}
              <circle cx="16" cy="6" r="1" />
              <circle cx="16" cy="26" r="1" />
              <circle cx="6" cy="16" r="1" />
              <circle cx="26" cy="16" r="1" />
              <circle cx="10" cy="10" r="1" />
              <circle cx="22" cy="10" r="1" />
              <circle cx="10" cy="22" r="1" />
              <circle cx="22" cy="22" r="1" />
            </svg>
          </div>
        ))}
      </div>
      
      {/* Actual content */}
      {children}
    </div>
  );
}
