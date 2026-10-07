import { Link } from "react-router-dom";
import { GAMES, formatPrice } from "@/data/games";
import Stars from "./Stars";

const PopularList = () => (
  <section className="flex min-h-0 flex-col lg:[grid-area:cards]" aria-labelledby="popular-mini">
    <h2 id="popular-mini" className="mb-2.5 font-body text-[0.85rem] font-normal text-muted-foreground">Популярное</h2>
    <ul>
      {GAMES.slice(0, 5).map((g, i) => (
        <li key={g.id} className="animate-fade-in" style={{ animationDelay: `${200 + i * 70}ms` }}>
          <Link
            to="/catalog"
            className="group grid grid-cols-[52px_1fr_auto] items-center gap-3.5 border-t border-border py-[11px] transition-colors"
          >
            <img src={g.image} alt={g.title} loading="lazy" className="h-[52px] w-[52px] rounded-[6px] object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="min-w-0">
              <p className="truncate font-head text-[1.1rem] font-medium transition-transform duration-300 group-hover:translate-x-1">{g.title}</p>
              <p className="text-[0.8rem] text-muted-foreground">{g.genre} · {g.developer}</p>
            </div>
            <div className="text-right">
              <Stars value={g.rating} className="block text-[0.8rem]" />
              <span className="text-[0.8rem] text-muted-foreground">{formatPrice(g.price)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export default PopularList;
