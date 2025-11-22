import { ReactNode, useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
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
        animationDelay: Math.random() * 5, // 0-5 seconds delay
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
              animationDelay: `${flake.animationDelay}s`,
              opacity: flake.opacity,
            }}
          >
            <svg
              width={flake.size}
              height={flake.size}
              viewBox="0 0 100 100"
              style={{ 
                pointerEvents: 'none',
                color: snowflakeColor
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Detailed snowflake matching user's example */}
              {/* Center hexagon */}
              <path d="M 50 35 L 58 40 L 58 50 L 50 55 L 42 50 L 42 40 Z" fill="currentColor" />
              
              {/* Branch 1: Top (12 o'clock) */}
              <line x1="50" y1="35" x2="50" y2="5" />
              <line x1="50" y1="15" x2="42" y2="22" />
              <line x1="50" y1="15" x2="58" y2="22" />
              <circle cx="50" cy="5" r="2.5" fill="currentColor" />
              
              {/* Branch 2: Bottom (6 o'clock) */}
              <line x1="50" y1="55" x2="50" y2="95" />
              <line x1="50" y1="75" x2="42" y2="68" />
              <line x1="50" y1="75" x2="58" y2="68" />
              <circle cx="50" cy="95" r="2.5" fill="currentColor" />
              
              {/* Branch 3: Top-right (2 o'clock) */}
              <line x1="58" y1="40" x2="82" y2="22" />
              <line x1="70" y1="28" x2="66" y2="38" />
              <line x1="70" y1="28" x2="78" y2="32" />
              <circle cx="82" cy="22" r="2.5" fill="currentColor" />
              
              {/* Branch 4: Bottom-left (8 o'clock) */}
              <line x1="42" y1="50" x2="18" y2="68" />
              <line x1="30" y1="62" x2="34" y2="52" />
              <line x1="30" y1="62" x2="22" y2="58" />
              <circle cx="18" cy="68" r="2.5" fill="currentColor" />
              
              {/* Branch 5: Top-left (10 o'clock) */}
              <line x1="42" y1="40" x2="18" y2="22" />
              <line x1="30" y1="28" x2="22" y2="32" />
              <line x1="30" y1="28" x2="34" y2="38" />
              <circle cx="18" cy="22" r="2.5" fill="currentColor" />
              
              {/* Branch 6: Bottom-right (4 o'clock) */}
              <line x1="58" y1="50" x2="82" y2="68" />
              <line x1="70" y1="62" x2="78" y2="58" />
              <line x1="70" y1="62" x2="66" y2="52" />
              <circle cx="82" cy="68" r="2.5" fill="currentColor" />
            </svg>
          </div>
        ))}
      </div>
      
      {/* Actual content */}
      {children}
    </div>
  );
}
