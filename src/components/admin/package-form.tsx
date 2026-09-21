"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox, Field, FormError, Input, Select, SubmitButton, Textarea } from "./form-ui";
import { ImageField } from "./image-field";
import type { FormState } from "@/lib/form";

export type ItineraryDay = { day: number; title: string; description: string };

export type PackageInitial = {
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: string | null;
  durationDays: number | null;
  departureCity: string | null;
  coverImage: string | null;
  destinationId: number;
  categoryId: number | null;
  included: string[];
  notIncluded: string[];
  itinerary: ItineraryDay[];
  featured: boolean;
  active: boolean;
};

type Option = { id: number; name: string; state?: string };

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  destinations: Option[];
  categories: Option[];
  initial?: PackageInitial;
  submitLabel?: string;
};

export function PackageForm({
  action,
  destinations,
  categories,
  initial,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const [days, setDays] = useState<ItineraryDay[]>(initial?.itinerary ?? []);
  const errors = state?.fieldErrors;

  function addDay() {
    setDays((prev) => [...prev, { day: prev.length + 1, title: "", description: "" }]);
  }

  function updateDay(index: number, patch: Partial<ItineraryDay>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function removeDay(index: number) {
    // Renumera para não deixar buraco (Dia 1, 3, 4) depois de remover.
    setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormError message={state?.error} />

      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <Field label="Título" name="title" errors={errors?.title}>
          <Input
            name="title"
            required
            defaultValue={initial?.title ?? ""}
            placeholder="Ubatuba: praias e cachoeiras"
          />
        </Field>

        <Field label="Destino" name="destinationId" errors={errors?.destinationId}>
          <Select name="destinationId" required defaultValue={initial?.destinationId ?? ""}>
            <option value="" disabled>
              Selecione...
            </option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.state ? ` · ${d.state}` : ""}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <p className="rounded-lg bg-surface-alt px-4 py-3 text-xs text-muted">
        Só título e destino são obrigatórios. Salve agora e complete depois — o endereço do pacote
        no site é gerado a partir do título.
      </p>

      <Field label="Categoria" name="categoryId" hint="Opcional." errors={errors?.categoryId}>
        <Select name="categoryId" defaultValue={initial?.categoryId ?? ""}>
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Chamada curta"
        name="shortDescription"
        hint="Opcional. Aparece nos cards da listagem, até 200 caracteres."
        errors={errors?.shortDescription}
      >
        <Textarea
          name="shortDescription"
          rows={2}
          maxLength={200}
          defaultValue={initial?.shortDescription ?? ""}
        />
      </Field>

      <Field
        label="Descrição completa"
        name="description"
        hint="Opcional. Separe os parágrafos com uma linha em branco."
        errors={errors?.description}
      >
        <Textarea name="description" rows={6} defaultValue={initial?.description ?? ""} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Preço por pessoa (R$)" name="price" hint="Opcional." errors={errors?.price}>
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.price ?? ""}
            placeholder="1290.00"
          />
        </Field>

        <Field
          label="Duração (dias)"
          name="durationDays"
          hint="Opcional."
          errors={errors?.durationDays}
        >
          <Input
            name="durationDays"
            type="number"
            min="1"
            max="90"
            defaultValue={initial?.durationDays ?? ""}
          />
        </Field>

        <Field
          label="Cidade de saída"
          name="departureCity"
          hint="Opcional."
          errors={errors?.departureCity}
        >
          <Input
            name="departureCity"
            defaultValue={initial?.departureCity ?? ""}
            placeholder="São Paulo"
          />
        </Field>
      </div>

      <ImageField
        name="coverImage"
        label="Imagem de capa"
        current={initial?.coverImage}
        errors={errors?.coverImage}
      />

      <section className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
        <Field
          label="O que está incluso"
          name="included"
          hint="Um item por linha. Opcional."
          errors={errors?.included}
        >
          <Textarea
            name="included"
            rows={6}
            defaultValue={initial?.included.join("\n") ?? ""}
            placeholder={"Transporte em van executiva\nHospedagem com café\nGuia local"}
          />
        </Field>

        <Field
          label="Não incluso"
          name="notIncluded"
          hint="Um item por linha. Opcional."
          errors={errors?.notIncluded}
        >
          <Textarea
            name="notIncluded"
            rows={6}
            defaultValue={initial?.notIncluded.join("\n") ?? ""}
            placeholder={"Almoços e jantares\nDespesas pessoais"}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Roteiro dia a dia
            </h2>
            {errors?.itinerary?.map((e) => (
              <p key={e} className="mt-1 text-xs font-medium text-red-600">
                {e}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={addDay}
            className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-sm font-medium transition hover:bg-brand-light hover:text-brand-dark"
          >
            <Plus className="size-4" />
            Adicionar dia
          </button>
        </div>

        {/* O roteiro é uma lista de objetos: vai como JSON num campo oculto. */}
        <input type="hidden" name="itinerary" value={JSON.stringify(days)} />

        {days.length === 0 ? (
          <p className="rounded-xl bg-background px-4 py-6 text-center text-sm text-muted">
            Nenhum dia cadastrado. O roteiro é opcional, mas ajuda muito a vender.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {days.map((d, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-background p-3">
                <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {d.day}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Input
                    value={d.title}
                    onChange={(e) => updateDay(i, { title: e.target.value })}
                    placeholder="Título do dia (ex.: Chegada e city tour)"
                  />
                  <Textarea
                    rows={2}
                    value={d.description}
                    onChange={(e) => updateDay(i, { description: e.target.value })}
                    placeholder="O que acontece nesse dia."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDay(i)}
                  title="Remover dia"
                  className="mt-1 h-fit rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap gap-6 border-t border-border pt-6">
        <Checkbox name="active" label="Publicado no site" defaultChecked={initial?.active ?? true} />
        <Checkbox name="featured" label="Destacar na home" defaultChecked={initial?.featured} />
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{submitLabel ?? "Salvar pacote"}</SubmitButton>
        <Link
          href="/admin/pacotes"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
