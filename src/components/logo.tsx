import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      aria-labelledby="logoTitle"
    >
      <title id="logoTitle">Plume Sonore Logo</title>
      <defs>
        <linearGradient id="featherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g transform="rotate(-15 50 50)">
        {/* Feather Quill */}
        <path
          d="M30 90 C 25 70, 25 30, 50 10 C 60 25, 70 40, 75 90"
          fill="url(#featherGradient)"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Feather Barbs */}
        <path
          d="M50 10 L 40 25 M 48 20 L 38 35 M 46 30 L 36 45 M 44 40 L 34 55 M 42 50 L 32 65 M 40 60 L 30 75"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
         {/* Sound Wave */}
        <path
            d="M 60 70 Q 65 60, 70 70 T 80 70"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="4"
            strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default Logo;
