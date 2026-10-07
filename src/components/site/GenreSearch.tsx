import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GENRES } from "@/data/games";

const GenreSearch = () => {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const hints = useMemo(() => {
    const v = q.trim().toLowerCase();
    return v ? GENRES.filter((g) => g.toLowerCase().includes(v)) : GENRES;
  }, [q]);

  const submit = (value = q) => {
    const v = value.trim();
    if (!v) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    navigate(`/catalog?genre=${encodeURIComponent(v)}`);
  };

  return (
    <section id="search" className="scroll-mt-6 pt-1.5 animate-fade-in [animation-delay:120ms] lg:[grid-area:search]" aria-labelledby="search-title">
      <h2 id="search-title" className="mb-2.5 font-body text-[0.85rem] font-normal text-muted-foreground">Поиск по жанрам</h2>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <div className={`flex rounded-[6px] border p-[5px] transition-colors ${error ? "border-destructive" : "border-border focus-within:border-muted-foreground"}`}>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setError(false);
            }}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 150)}
            placeholder="Шутер, RPG, стратегия…"
            aria-label="Жанр игры"
            className="min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="rounded-[6px] bg-primary px-[26px] py-[11px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Найти
          </button>
        </div>
        {focus && hints.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-[6px] border border-border bg-popover py-1 shadow-xl animate-scale-in">
            {hints.map((g) => (
              <li key={g}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ(g);
                    submit(g);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {g}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>
      {error && <p className="mt-2 text-xs text-destructive">Введите жанр, например «RPG»</p>}
      <div className="mt-3 flex flex-wrap gap-4 text-[0.85rem] text-muted-foreground">
        {["Экшен", "RPG", "Гонки", "Инди"].map((t) => (
          <button key={t} type="button" onClick={() => submit(t)} className="story-link transition-colors hover:text-foreground">
            {t}
          </button>
        ))}
      </div>
    </section>
  );
};

export default GenreSearch;
