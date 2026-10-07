import { FormEvent, useState } from "react";
import { toast } from "sonner";
import PageShell from "@/components/site/PageShell";
import Field from "@/components/site/Field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { GENRES } from "@/data/games";

const INITIAL = { title: "", genre: "", developer: "", description: "", price: "" };

const Admin = () => {
  const [f, setF] = useState(INITIAL);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.title.trim()) er.title = "Укажите название";
    if (!f.genre) er.genre = "Выберите жанр";
    if (!preview) er.image = "Загрузите изображение";
    if (!f.developer.trim()) er.developer = "Укажите разработчика";
    if (!f.description.trim()) er.description = "Добавьте описание";
    if (!(Number(f.price) > 0)) er.price = "Укажите стоимость";
    setErrors(er);
    if (Object.keys(er).length) return;
    toast.success(`Игра «${f.title}» добавлена`);
    setF(INITIAL);
    setPreview(null);
  };

  return (
    <PageShell title="Админ-панель" subtitle="Добавление новой игры в каталог.">
      <form onSubmit={submit} noValidate className="grid max-w-4xl grid-cols-1 gap-6 rounded-[6px] border border-border bg-card p-6 surface-shadow md:grid-cols-[1fr_240px] md:p-8">
        <div className="flex flex-col gap-5">
          <Field id="title" label="Название игры" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} error={errors.title} />
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-muted-foreground">Жанр</Label>
            <Select value={f.genre} onValueChange={(v) => setF({ ...f, genre: v })}>
              <SelectTrigger className={`h-11 rounded-[6px] bg-transparent ${errors.genre ? "border-destructive" : ""}`}><SelectValue placeholder="Выберите жанр" /></SelectTrigger>
              <SelectContent>{GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
            {errors.genre && <span className="text-xs text-destructive">{errors.genre}</span>}
          </div>
          <Field id="developer" label="Компания-разработчик" value={f.developer} onChange={(e) => setF({ ...f, developer: e.target.value })} error={errors.developer} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc" className="text-sm text-muted-foreground">Описание</Label>
            <Textarea id="desc" rows={5} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`rounded-[6px] bg-transparent ${errors.description ? "border-destructive" : ""}`} />
            {errors.description && <span className="text-xs text-destructive">{errors.description}</span>}
          </div>
          <Field id="price" type="number" min={0} label="Стоимость, ₽" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} error={errors.price} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-muted-foreground">Изображение</Label>
          <label className={`relative grid aspect-[3/4] cursor-pointer place-items-center overflow-hidden rounded-[6px] border border-dashed transition-colors hover:border-muted-foreground ${errors.image ? "border-destructive" : "border-border"}`}>
            {preview ? (
              <img src={preview} alt="Превью" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><Icon name="ImagePlus" size={28} /> Выбрать файл</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          {errors.image && <span className="text-xs text-destructive">{errors.image}</span>}
          <button type="submit" className="mt-auto h-11 rounded-[6px] bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90">Добавить</button>
        </div>
      </form>
    </PageShell>
  );
};

export default Admin;
