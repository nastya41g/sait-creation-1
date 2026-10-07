import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { GAMES } from "@/data/games";
import { useReveal } from "@/hooks/use-reveal";
import GameCard from "./GameCard";

const PopularGames = () => {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="reveal py-16 md:py-20" aria-labelledby="pop-title">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 id="pop-title" className="font-head text-3xl font-medium tracking-tight md:text-4xl">Популярные игры</h2>
        <Link to="/catalog.html" className="story-link flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          Весь каталог <Icon name="ArrowRight" size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {GAMES.slice(0, 5).map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
};

export default PopularGames;
