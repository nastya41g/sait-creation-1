import { InputHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; id: string };

const Field = ({ label, error, id, className, ...rest }: Props) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id} className="text-sm text-muted-foreground">{label}</Label>
    <Input
      id={id}
      aria-invalid={!!error}
      className={`h-11 rounded-[6px] bg-transparent ${error ? "border-destructive" : ""} ${className ?? ""}`}
      {...rest}
    />
    {error && <span className="text-xs text-destructive animate-fade-in">{error}</span>}
  </div>
);

export default Field;
