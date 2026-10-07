import Icon from "@/components/ui/icon";
import { useReveal } from "@/hooks/use-reveal";

const PARTNERS = [
  { name: "Nova Forge", icon: "Hexagon" },
  { name: "Ember Lab", icon: "Flame" },
  { name: "Drift Works", icon: "Gauge" },
  { name: "North Hall", icon: "Mountain" },
  { name: "Tiny Keep", icon: "Castle" },
  { name: "Orbit Games", icon: "Orbit" },
];

const Partners = () => {
  const ref = useReveal<HTMLElement>();
  const list = [...PARTNERS, ...PARTNERS];
  return (
    <section ref={ref} className="reveal py-16 md:py-20" aria-labelledby="partners-title">
      <h2 id="partners-title" className="mb-10 font-head text-3xl font-medium tracking-tight md:text-4xl">Наши партнёры</h2>
      <div className="relative overflow-hidden border-y border-border py-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="flex w-max animate-marquee gap-14 hover:[animation-play-state:paused]">
          {list.map((p, i) => (
            <li key={i} className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground" aria-hidden={i >= PARTNERS.length}>
              <Icon name={p.icon} size={30} />
              <span className="whitespace-nowrap font-head text-2xl font-semibold tracking-tight">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Partners;
