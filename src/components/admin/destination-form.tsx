"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Checkbox, Field, FormError, Input, SubmitButton, Textarea } from "./form-ui";
import { ImageField } from "./image-field";
import type { FormState } from "@/lib/form";

type Destination = {
  name: string;
  state: string;
  region: string | null;
  description: string | null;
  coverImage: string | null;
  featured: boolean;
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Destination;
  submitLabel?: string;
};

const regions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

export function DestinationForm({ action, initial, submitLabel }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormError message={state?.error} />

      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <Field label="Nome" name="name" errors={errors?.name}>
          <Input name="name" required defaultValue={initial?.name ?? ""} placeholder="Ubatuba" />
        </Field>

        <Field label="Estado (UF)" name="state" errors={errors?.state}>
          <Input
            name="state"
            required
            maxLength={2}
            defaultValue={initial?.state ?? ""}
            placeholder="SP"
            className="uppercase"
          />
        </Field>
      </div>

      <p className="rounded-lg bg-surface-alt px-4 py-3 text-xs text-muted">
        Só nome e estado são obrigatórios. O resto pode ficar para depois — o endereço do destino
        no site é gerado a partir do nome.
      </p>

      <Field label="Região" name="region" hint="Opcional." errors={errors?.region}>
        <Input
          name="region"
          list="regioes"
          defaultValue={initial?.region ?? ""}
          placeholder="Sudeste"
        />
        <datalist id="regioes">
          {regions.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </Field>

      <Field label="Descrição" name="description" hint="Opcional." errors={errors?.description}>
        <Textarea
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
          placeholder="O que faz esse destino valer a viagem."
        />
      </Field>

      <ImageField
        name="coverImage"
        label="Imagem de capa"
        current={initial?.coverImage}
        errors={errors?.coverImage}
      />

      <Checkbox name="featured" label="Destacar na home" defaultChecked={initial?.featured} />

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{submitLabel ?? "Salvar destino"}</SubmitButton>
        <Link
          href="/admin/destinos"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
