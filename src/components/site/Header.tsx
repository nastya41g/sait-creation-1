import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "./Logo";
import { useTheme } from "@/hooks/use-theme";

const LINKS = [
  { to: "/catalog", label: "Каталог игр" },
  { to: "/#search", label: "Поиск" },
  { to: "/profile", label: "Личный кабинет" },
  { to: "/#new", label: "Новинки" },
  { to: "/login", label: "Войти" },
  { to: "/register", label: "Регистрация" },
];

const NavLink = ({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) =>
  to.startsWith("/#") ? (
    <a href={to} onClick={onClick} className="story-link transition-colors hover:text-foreground">
      {label}
    </a>
  ) : (
    <Link to={to} onClick={onClick} className="story-link transition-colors hover:text-foreground">
      {label}
    </Link>
  );

const Header = ({ hideThemeToggle = false }: { hideThemeToggle?: boolean }) => {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="animate-fade-in">
      <nav className="flex items-center justify-between gap-6 text-[0.88rem] leading-[1.35] lg:grid lg:grid-cols-[1fr_1fr_1fr_1fr_auto]" aria-label="Главное меню">
        <Logo />

        <div className="hidden lg:flex lg:flex-col text-muted-foreground">
          <NavLink {...LINKS[0]} />
          <NavLink {...LINKS[1]} />
        </div>
        <div className="hidden lg:flex lg:flex-col text-muted-foreground">
          <NavLink {...LINKS[2]} />
          <NavLink {...LINKS[3]} />
        </div>
        <div className="hidden lg:flex lg:flex-col text-muted-foreground">
          <NavLink {...LINKS[4]} />
          <NavLink {...LINKS[5]} />
        </div>

        <div className="flex items-center gap-3">
          {!hideThemeToggle && (
            <button
              onClick={toggle}
              aria-label="Сменить тему"
              className="grid h-[30px] w-[30px] place-items-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name={theme === "dark" ? "Sun" : "Moon"} size={15} />
            </button>
          )}
          <Link
            to="/profile"
            aria-label="Корзина"
            className="grid h-[30px] w-[30px] place-items-center border-2 border-foreground text-[0.8rem] font-semibold transition-transform hover:scale-105"
          >
            0
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Открыть меню" className="grid h-[30px] w-[30px] place-items-center lg:hidden">
                <Icon name="Menu" size={22} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <SheetTitle className="mb-8"><Logo /></SheetTitle>
              <ul className="flex flex-col gap-5 font-head text-lg">
                {LINKS.map((l) => (
                  <li key={l.to}><NavLink {...l} onClick={() => setOpen(false)} /></li>
                ))}
                <li><NavLink to="/admin" label="Админ-панель" onClick={() => setOpen(false)} /></li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
