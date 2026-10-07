import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LogoMark = ({ size = 34, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={cn("logo-mark shrink-0", className)}>
    <rect x="6.5" y="6.5" width="27" height="27" rx="6" className="logo-diamond fill-foreground" />
    <path d="M16.5 13.2v13.6c0 .9 1 1.4 1.7.9l9.6-6.8c.6-.4.6-1.4 0-1.8l-9.6-6.8c-.7-.5-1.7 0-1.7.9Z" className="fill-background" />
    <path d="M33 1.5l1.4 3.6 3.6 1.4-3.6 1.4L33 11.5l-1.4-3.6-3.6-1.4 3.6-1.4Z" className="logo-spark fill-star" />
  </svg>
);

const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("logo group flex items-center gap-2.5", className)} aria-label="BestGames — на главную">
    <LogoMark />
    <span className="font-head text-[1.05rem] font-bold uppercase leading-none tracking-[0.02em]">
      Best<span className="font-normal text-muted-foreground transition-colors group-hover:text-foreground">Games</span>
    </span>
  </Link>
);

export default Logo;