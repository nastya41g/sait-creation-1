import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "@/components/site/PageShell";
import Field from "@/components/site/Field";
import { Checkbox } from "@/components/ui/checkbox";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s()-]{9,}$/;

const INITIAL = { email: "", lastName: "", firstName: "", birth: "", phone: "", password: "", repeat: "" };

const Register = () => {
  const [f, setF] = useState(INITIAL);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const set = (k: keyof typeof INITIAL) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!EMAIL.test(f.email)) er.email = "Введите корректный e-mail";
    if (!f.lastName.trim()) er.lastName = "Укажите фамилию";
    if (!f.firstName.trim()) er.firstName = "Укажите имя";
    if (!f.birth) er.birth = "Укажите дату рождения";
    if (!PHONE.test(f.phone)) er.phone = "Введите номер телефона";
    if (f.password.length < 6) er.password = "Минимум 6 символов";
    if (f.repeat !== f.password || !f.repeat) er.repeat = "Пароли не совпадают";
    if (!agree) er.agree = "Необходимо согласие";
    setErrors(er);
    if (Object.keys(er).length) return;
    toast.success("Аккаунт создан");
    navigate("/profile.html");
  };

  return (
    <PageShell title="Регистрация" subtitle="Все поля обязательны для заполнения." narrow>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-[6px] border border-border bg-card p-6 surface-shadow md:p-8">
        <Field id="email" type="email" label="E-mail" value={f.email} onChange={set("email")} error={errors.email} required />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="lastName" label="Фамилия" value={f.lastName} onChange={set("lastName")} error={errors.lastName} required />
          <Field id="firstName" label="Имя" value={f.firstName} onChange={set("firstName")} error={errors.firstName} required />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="birth" type="date" label="Дата рождения" value={f.birth} onChange={set("birth")} error={errors.birth} required />
          <Field id="phone" type="tel" label="Телефон" placeholder="+7 900 000-00-00" value={f.phone} onChange={set("phone")} error={errors.phone} required />
        </div>
        <Field id="password" type="password" label="Пароль" value={f.password} onChange={set("password")} error={errors.password} required />
        <Field id="repeat" type="password" label="Повтор пароля" value={f.repeat} onChange={set("repeat")} error={errors.repeat} required />
        <div>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
            <span>Я согласен на обработку персональных данных</span>
          </label>
          {errors.agree && <span className="mt-1 block text-xs text-destructive">{errors.agree}</span>}
        </div>
        <button type="submit" className="h-11 rounded-[6px] bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90">Зарегистрироваться</button>
        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт? <Link to="/login.html" className="story-link text-foreground">Войти</Link>
        </p>
      </form>
    </PageShell>
  );
};

export default Register;
