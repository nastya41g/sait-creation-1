import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "@/components/site/PageShell";
import Field from "@/components/site/Field";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!EMAIL.test(email)) er.email = "Введите корректный e-mail";
    if (password.length < 6) er.password = "Минимум 6 символов";
    setErrors(er);
    if (Object.keys(er).length) return;
    toast.success("Вы вошли в аккаунт");
    navigate("/profile.html");
  };

  return (
    <PageShell title="Вход" subtitle="Войдите, чтобы видеть покупки и настройки." narrow>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-[6px] border border-border bg-card p-6 surface-shadow md:p-8">
        <Field id="email" type="email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@mail.ru" autoComplete="email" />
        <Field id="password" type="password" label="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="••••••" autoComplete="current-password" />
        <button type="submit" className="h-11 rounded-[6px] bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90">Войти</button>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button type="button" onClick={() => setRecoverOpen(true)} className="story-link text-muted-foreground hover:text-foreground">Забыли пароль?</button>
          <Link to="/register.html" className="story-link">Регистрация</Link>
        </div>
      </form>

      <Dialog open={recoverOpen} onOpenChange={setRecoverOpen}>
        <DialogContent className="rounded-[6px]">
          <DialogHeader>
            <DialogTitle className="font-head">Восстановление пароля</DialogTitle>
            <DialogDescription>Пришлём ссылку для сброса пароля на вашу почту.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!EMAIL.test(recoverEmail)) return toast.error("Введите корректный e-mail");
              toast.success("Ссылка отправлена на " + recoverEmail);
              setRecoverOpen(false);
            }}
            className="flex flex-col gap-3"
          >
            <Input type="email" value={recoverEmail} onChange={(e) => setRecoverEmail(e.target.value)} placeholder="you@mail.ru" className="h-11 rounded-[6px]" />
            <button type="submit" className="h-11 rounded-[6px] bg-primary font-medium text-primary-foreground">Отправить ссылку</button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Login;
