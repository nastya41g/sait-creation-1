import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import GameCard from "@/components/site/GameCard";
import Icon from "@/components/ui/icon";
import Stars from "@/components/site/Stars";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { GAMES, GENRES, formatPrice, type Game } from "@/data/games";

const Filter = ({ selected, toggle, reset }: { selected: string[]; toggle: (g: string) => void; reset: () => void }) => (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-head text-lg font-medium">Жанры</h2>
      {selected.length > 0 && <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">Сбросить</button>}
    </div>
    <ul className="flex flex-col gap-3">
      {GENRES.map((g) => (
        <li key={g}>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox checked={selected.includes(g)} onCheckedChange={() => toggle(g)} />
            {g}
            <span className="ml-auto text-xs text-muted-foreground">{GAMES.filter((x) => x.genre === g).length}</span>
          </label>
        </li>
      ))}
    </ul>
  </div>
);

const Catalog = () => {
  const [params] = useSearchParams();
  const initial = params.get("genre");
  const match = initial ? GENRES.find((g) => g.toLowerCase().includes(initial.toLowerCase())) : undefined;
  const [selected, setSelected] = useState<string[]>(match ? [match] : []);
  const [active, setActive] = useState<Game | null>(null);

  const toggle = (g: string) => setSelected((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]));
  const list = useMemo(() => (selected.length ? GAMES.filter((g) => selected.includes(g.genre)) : GAMES), [selected]);

  return (
    <PageShell title="Каталог игр" subtitle={`Найдено игр: ${list.length}`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-[6px] border border-border bg-card p-5">
            <Filter selected={selected} toggle={toggle} reset={() => setSelected([])} />
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 rounded-[6px] border border-border px-4 py-2 text-sm">
                  <Icon name="SlidersHorizontal" size={16} /> Фильтр
                  {selected.length > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[0.7rem] text-primary-foreground">{selected.length}</span>}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background">
                <SheetTitle className="sr-only">Фильтр</SheetTitle>
                <div className="pt-6"><Filter selected={selected} toggle={toggle} reset={() => setSelected([])} /></div>
              </SheetContent>
            </Sheet>
            <div className="flex gap-2 overflow-x-auto">
              {selected.map((g) => (
                <button key={g} onClick={() => toggle(g)} className="flex shrink-0 items-center gap-1 rounded-[6px] bg-secondary px-2.5 py-1 text-xs">
                  {g} <Icon name="X" size={12} />
                </button>
              ))}
            </div>
          </div>

          {list.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {list.map((g) => (
                <GameCard key={g.id} game={g} buttonLabel="Подробнее" onButton={setActive} />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-muted-foreground">По выбранным жанрам игр пока нет.</p>
          )}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="overflow-hidden rounded-[6px] p-0 sm:max-w-lg">
          {active && (
            <>
              <img src={active.image} alt={active.title} className="aspect-video w-full object-cover" />
              <div className="flex flex-col gap-3 p-6">
                <DialogHeader>
                  <DialogTitle className="font-head text-2xl">{active.title}</DialogTitle>
                  <DialogDescription>{active.genre} · {active.developer}</DialogDescription>
                </DialogHeader>
                <Stars value={active.rating} />
                <p className="text-sm text-muted-foreground">{active.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-head text-2xl">{formatPrice(active.price)}</span>
                  <button
                    onClick={() => {
                      toast.success(`«${active.title}» добавлена в корзину`);
                      setActive(null);
                    }}
                    className="rounded-[6px] bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
                  >
                    Купить
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Catalog;
