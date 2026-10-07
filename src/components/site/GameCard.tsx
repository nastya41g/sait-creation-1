import { useNavigate } from "react-router-dom";
import type { Game } from "@/data/games";
import { formatPrice } from "@/data/games";
import Stars from "./Stars";

type Props = {
  game: Game;
  to?: string;
  buttonLabel?: string;
  onButton?: (g: Game) => void;
};

const GameCard = ({ game, to = "/catalog", buttonLabel = "В каталог", onButton }: Props) => {
  const navigate = useNavigate();
  const open = () => (onButton ? onButton(game) : navigate(to));

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[6px] border border-border bg-card surface-shadow transition-all duration-300 hover:-translate-y-1 hover:border-muted-foreground/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <img src={game.image} alt={game.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-[6px] bg-background/80 px-2 py-1 text-[0.7rem] backdrop-blur">{game.genre}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-head text-lg font-medium leading-tight">{game.title}</h3>
        <p className="text-xs text-muted-foreground">{game.genre} · {game.developer}</p>
        <Stars value={game.rating} className="mt-1 text-sm" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-head text-xl">{formatPrice(game.price)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="rounded-[6px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

export default GameCard;
