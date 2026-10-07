import { useState } from "react";
import { toast } from "sonner";
import PageShell from "@/components/site/PageShell";
import Icon from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTheme } from "@/hooks/use-theme";
import { formatPrice } from "@/data/games";

const USER = [
  { label: "E-mail", value: "ivan.petrov@games.ru" },
  { label: "Фамилия", value: "Петров" },
  { label: "Имя", value: "Иван" },
  { label: "Дата рождения", value: "14.03.2001" },
  { label: "Телефон", value: "+7 912 345-67-89" },
];

const HISTORY = [
  { date: "02.10.2026", name: "Cyber Drift 2077", price: 2499 },
  { date: "21.09.2026", name: "Набор скинов «Неон» — Apex Rally", price: 349 },
  { date: "05.09.2026", name: "Runebound", price: 1999 },
  { date: "18.08.2026", name: "Сезонный пропуск — Starfall Legion", price: 599 },
];

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const [notify, setNotify] = useState(true);
  const [promo, setPromo] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ old: "", next: "", repeat: "" });

  return (
    <PageShell title="Личный кабинет" subtitle="Иван, добро пожаловать обратно.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.55fr]">
        <section className="rounded-[6px] border border-border bg-card p-6 surface-shadow" aria-labelledby="u-title">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-[6px] bg-primary font-head text-xl text-primary-foreground">ИП</span>
            <h2 id="u-title" className="font-head text-2xl font-medium">Иван Петров</h2>
          </div>
          <dl className="divide-y divide-border">
            {USER.map((u) => (
              <div key={u.label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-muted-foreground">{u.label}</dt>
                <dd className="text-right">{u.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[6px] border border-border bg-card p-6 surface-shadow" aria-labelledby="h-title">
          <h2 id="h-title" className="mb-4 font-head text-2xl font-medium">История покупок</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Игра / предмет</TableHead>
                <TableHead className="text-right">Стоимость</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HISTORY.map((h) => (
                <TableRow key={h.date + h.name}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{h.date}</TableCell>
                  <TableCell>{h.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-right font-head">{formatPrice(h.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="rounded-[6px] border border-border bg-card p-6 surface-shadow lg:col-span-2" aria-labelledby="s-title">
          <h2 id="s-title" className="mb-4 font-head text-2xl font-medium">Настройки профиля</h2>
          <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
            <label className="flex items-center justify-between border-b border-border py-4">
              <span className="flex items-center gap-3"><Icon name="Moon" size={18} /> Тёмная тема</span>
              <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
            </label>
            <label className="flex items-center justify-between border-b border-border py-4">
              <span className="flex items-center gap-3"><Icon name="Bell" size={18} /> Уведомления о покупках</span>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </label>
            <label className="flex items-center justify-between border-b border-border py-4">
              <span className="flex items-center gap-3"><Icon name="Tag" size={18} /> Рассылка об акциях</span>
              <Switch checked={promo} onCheckedChange={setPromo} />
            </label>
            <div className="flex items-center justify-between border-b border-border py-4">
              <span className="flex items-center gap-3"><Icon name="KeyRound" size={18} /> Пароль</span>
              <button onClick={() => setPwOpen(true)} className="rounded-[6px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Сменить пароль</button>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="rounded-[6px]">
          <DialogHeader><DialogTitle className="font-head">Смена пароля</DialogTitle></DialogHeader>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!pw.old) return toast.error("Введите текущий пароль");
              if (pw.next.length < 6) return toast.error("Новый пароль — минимум 6 символов");
              if (pw.next !== pw.repeat) return toast.error("Пароли не совпадают");
              toast.success("Пароль изменён");
              setPw({ old: "", next: "", repeat: "" });
              setPwOpen(false);
            }}
          >
            <Input type="password" placeholder="Текущий пароль" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} className="h-11 rounded-[6px]" />
            <Input type="password" placeholder="Новый пароль" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="h-11 rounded-[6px]" />
            <Input type="password" placeholder="Повторите пароль" value={pw.repeat} onChange={(e) => setPw({ ...pw, repeat: e.target.value })} className="h-11 rounded-[6px]" />
            <button type="submit" className="h-11 rounded-[6px] bg-primary font-medium text-primary-foreground">Сохранить</button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Profile;
