import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Logo from "./Logo";

const INFO = ["Клиентам", "Партнёрам", "О нас", "Контакты"];
const NAV = [
  { to: "/", label: "Главная" },
  { to: "/register", label: "Регистрация" },
  { to: "/login", label: "Авторизация" },
  { to: "/profile", label: "Личный кабинет" },
  { to: "/#search", label: "Поиск" },
];

const Footer = () => (
  <footer className="border-t border-border">
    <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2 md:px-7 lg:grid-cols-[1.55fr_1fr_1fr] lg:px-[30px]">
      <div className="flex flex-col gap-5">
        <Logo />
        <p className="max-w-xs text-sm text-muted-foreground">Маркетплейс компьютерных игр и внутриигровых предметов.</p>
        <address className="flex flex-col gap-2 not-italic">
          <a href="tel:88009995599" className="flex items-center gap-2 font-head text-xl hover:opacity-80">
            <Icon name="Phone" size={16} /> 8-800-999-55-99
          </a>
          <a href="mailto:best@games.ru" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Icon name="Mail" size={16} /> best@games.ru
          </a>
        </address>
      </div>
      <nav aria-label="Информация">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Информация</h3>
        <ul className="flex flex-col gap-2.5">
          {INFO.map((i) => (
            <li key={i}><a href="#" className="story-link">{i}</a></li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Навигация по сайту">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Навигация</h3>
        <ul className="flex flex-col gap-2.5">
          {NAV.map((n) => (
            <li key={n.label}>
              {n.to.startsWith("/#") ? (
                <a href={n.to} className="story-link">{n.label}</a>
              ) : (
                <Link to={n.to} className="story-link">{n.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
    <div className="mx-auto flex max-w-[1920px] flex-col gap-2 border-t border-border px-4 py-5 text-xs text-muted-foreground md:flex-row md:justify-between md:px-7 lg:px-[30px]">
      <span>© 2026 BestGames</span>
      <Link to="/light" className="hover:text-foreground">Светлая версия главной</Link>
    </div>
  </footer>
);

export default Footer;
