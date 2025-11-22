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
              viewBox="0 0 24 24"
              style={{ 
                pointerEvents: 'none',
                color: snowflakeColor
              }}
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
      
      {/* Actual content */}
      {children}
    </div>
  );
}
