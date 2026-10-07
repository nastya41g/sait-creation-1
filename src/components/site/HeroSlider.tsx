import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { SLIDES, formatPrice } from "@/data/games";

const INTERVAL = 6000;

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => setIndex((i + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, go]);

  return (
    <section
      id="new"
      aria-roledescription="carousel"
      aria-label="Новинки игр"
      className="group relative min-h-[420px] overflow-hidden rounded-[6px] bg-surface animate-scale-in md:min-h-[520px] lg:[grid-area:slider] lg:min-h-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt={s.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === index ? "opacity-100 animate-slow-zoom" : "opacity-0"}`}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--background))_4%,transparent_55%)] dark:bg-[linear-gradient(to_top,hsl(var(--background))_4%,transparent_55%)]" />

      <button
        onClick={() => go(index - 1)}
        aria-label="Предыдущий слайд"
        className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-[6px] border border-white/20 bg-black/30 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 md:grid"
      >
        <Icon name="ChevronLeft" size={20} />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Следующий слайд"
        className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-[6px] border border-white/20 bg-black/30 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 md:grid"
      >
        <Icon name="ChevronRight" size={20} />
      </button>

      <div key={index} className="absolute bottom-7 left-5 right-5 z-[1] text-center md:bottom-9 md:left-10 md:right-10">
        <p className="mb-1.5 font-head text-lg font-medium text-muted-foreground animate-fade-in md:text-xl">{SLIDES[index].tag}</p>
        <h1 className="font-head text-[40px] font-medium leading-[1.05] tracking-[-0.02em] animate-fade-in [animation-delay:80ms] md:text-[56px] xl:text-[64px]">
          {SLIDES[index].title}
        </h1>
        <div className="mt-5 flex items-center justify-center gap-[22px] animate-fade-in [animation-delay:160ms]">
          <span className="font-head text-[1.4rem]">{formatPrice(SLIDES[index].price)}</span>
          <Link
            to="/catalog.html"
            className="rounded-[6px] bg-primary px-[26px] py-[11px] font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            Подробнее
          </Link>
        </div>
        <div className="mt-[22px] flex justify-center gap-[7px]" role="tablist" aria-label="Слайды">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Слайд ${i + 1}`}
              onClick={() => go(i)}
              className="relative h-[2px] w-[22px] overflow-hidden bg-border py-0 before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']"
            >
              {i === index && (
                <span
                  className={`absolute inset-0 origin-left bg-foreground ${paused ? "" : "animate-progress"}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
