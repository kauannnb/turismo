"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Checkbox, Field, FormError, Input, SubmitButton, Textarea } from "./form-ui";
import { ALLOWED_IMAGE_HOSTS, slugify, type FormState } from "@/lib/form";

type Destination = {
  name: string;
  slug: string;
  state: string;
  region: string;
  description: string;
  coverImage: string;
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
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [cover, setCover] = useState(initial?.coverImage ?? "");
  const errors = state?.fieldErrors;

  // Em destino novo, o slug acompanha o nome até a pessoa editá-lo à mão.
  const slugTouched = slug !== "" && slug !== slugify(name);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" errors={errors?.name}>
          <Input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!initial && !slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Bonito"
          />
        </Field>

        <Field
          label="Endereço no site (slug)"
          name="slug"
          hint={`/destinos/${slug || "..."}`}
          errors={errors?.slug}
        >
          <Input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="bonito"
          />
        </Field>

        <Field label="Estado (UF)" name="state" errors={errors?.state}>
          <Input
            name="state"
            required
            maxLength={2}
            defaultValue={initial?.state ?? ""}
            placeholder="MS"
            className="uppercase"
          />
        </Field>

        <Field label="Região" name="region" errors={errors?.region}>
          <Input
            name="region"
            required
            list="regioes"
            defaultValue={initial?.region ?? ""}
            placeholder="Centro-Oeste"
          />
          <datalist id="regioes">
            {regions.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Descrição" name="description" errors={errors?.description}>
        <Textarea
          name="description"
          required
          rows={4}
          defaultValue={initial?.description ?? ""}
          placeholder="O que faz esse destino valer a viagem."
        />
      </Field>

      <Field
        label="Imagem de capa (URL)"
        name="coverImage"
        hint={`Somente https de: ${ALLOWED_IMAGE_HOSTS.join(", ")}`}
        errors={errors?.coverImage}
      >
        <Input
          name="coverImage"
          required
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />
      </Field>

      {cover && (
        // <img> em vez de next/image de propósito: é só pré-visualização e
        // não deve passar pelo otimizador nem depender de remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt="Prévia da capa"
          className="h-40 w-full rounded-xl object-cover ring-1 ring-border"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

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
