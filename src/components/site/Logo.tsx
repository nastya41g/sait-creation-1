import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("flex items-center gap-2.5 font-head text-xl font-semibold tracking-tight", className)} aria-label="BestGames — на главную">
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" className="transition-transform duration-500 hover:rotate-[120deg]">
      <path d="M15 2 28 26H2Z" className="fill-foreground" />
      <circle cx="15" cy="19" r="4" className="fill-background" />
    </svg>
    BestGames
  </Link>
);

export default Logo;
