"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Save } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
  children?: React.ReactNode;
  className?: string;
};

export function Field({ label, name, hint, errors, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !errors?.length && <p className="text-xs text-muted">{hint}</p>}
      {errors?.map((e) => (
        <p key={e} className="text-xs font-medium text-red-600">
          {e}
        </p>
      ))}
    </div>
  );
}

export function Input(props: React.ComponentProps<"input">) {
  return <input {...props} id={props.id ?? props.name} className={inputClass} />;
}

export function Textarea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} id={props.id ?? props.name} className={`${inputClass} min-h-24`} />;
}

export function Select(props: React.ComponentProps<"select">) {
  return <select {...props} id={props.id ?? props.name} className={inputClass} />;
}

export function Checkbox({ label, ...props }: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-medium">
      <input
        {...props}
        type="checkbox"
        id={props.id ?? props.name}
        className="size-4 rounded border-border text-brand focus:ring-2 focus:ring-brand/20"
      />
      {label}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </p>
  );
}

export function SubmitButton({ children = "Salvar" }: { children?: React.ReactNode }) {
  // useFormStatus só enxerga o <form> ancestral, por isso este botão precisa
  // ser um componente próprio em vez de ficar inline no formulário.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? "Salvando..." : children}
    </button>
  );
}
