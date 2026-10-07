import Icon from "@/components/ui/icon";
import { useReveal } from "@/hooks/use-reveal";

const ITEMS = [
  { icon: "BadgePercent", title: "Привлекательные цены", text: "Честная стоимость без наценок — сравниваем предложения издателей." },
  { icon: "CalendarHeart", title: "Ежемесячные акции", text: "Каждый месяц новые скидки на хиты и внутриигровые предметы." },
  { icon: "Headphones", title: "Круглосуточная поддержка", text: "Отвечаем 24/7 — по телефону, почте и в чате." },
  { icon: "Zap", title: "Быстрая покупка", text: "Ключ и предметы приходят сразу после оплаты, в один клик." },
];

const Advantages = () => {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="reveal py-16 md:py-20" aria-labelledby="adv-title">
      <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 id="adv-title" className="font-head text-3xl font-medium tracking-tight md:text-4xl">Почему BestGames</h2>
        <p className="max-w-sm text-sm text-muted-foreground">Маркетплейс для игроков и команд, которые ценят время.</p>
      </div>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[6px] border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {ITEMS.map((it, i) => (
          <li
            key={it.title}
            className="group flex gap-4 bg-background p-6 transition-colors duration-300 hover:bg-card md:flex-col md:p-8"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border border-border text-foreground transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <Icon name={it.icon} size={22} />
            </span>
            <div>
              <h3 className="mb-1.5 font-head text-lg font-medium">{it.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Advantages;
