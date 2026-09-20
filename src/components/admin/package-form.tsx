"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import {
  Checkbox,
  Field,
  FormError,
  Input,
  Select,
  SubmitButton,
  Textarea,
} from "./form-ui";
import { ALLOWED_IMAGE_HOSTS, slugify, type FormState } from "@/lib/form";

export type ItineraryDay = { day: number; title: string; description: string };

export type PackageInitial = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  durationDays: number;
  departureCity: string;
  coverImage: string;
  destinationId: number;
  categoryId: number;
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
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [cover, setCover] = useState(initial?.coverImage ?? "");
  const [days, setDays] = useState<ItineraryDay[]>(initial?.itinerary ?? []);
  const errors = state?.fieldErrors;

  const slugTouched = slug !== "" && slug !== slugify(title);

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

      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Identificação</h2>

        <Field label="Título" name="title" errors={errors?.title}>
          <Input
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!initial && !slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Bonito: Flutuação e Grutas"
          />
        </Field>

        <Field
          label="Endereço no site (slug)"
          name="slug"
          hint={`/pacotes/${slug || "..."}`}
          errors={errors?.slug}
        >
          <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
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

          <Field label="Categoria" name="categoryId" errors={errors?.categoryId}>
            <Select name="categoryId" required defaultValue={initial?.categoryId ?? ""}>
              <option value="" disabled>
                Selecione...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Chamada curta"
          name="shortDescription"
          hint="Aparece nos cards da listagem. Até 200 caracteres."
          errors={errors?.shortDescription}
        >
          <Textarea
            name="shortDescription"
            required
            rows={2}
            maxLength={200}
            defaultValue={initial?.shortDescription ?? ""}
          />
        </Field>

        <Field label="Descrição completa" name="description" errors={errors?.description}>
          <Textarea
            name="description"
            required
            rows={6}
            defaultValue={initial?.description ?? ""}
            placeholder="Separe os parágrafos com uma linha em branco."
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Preço e logística
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Preço por pessoa (R$)" name="price" errors={errors?.price}>
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initial?.price ?? ""}
              placeholder="1290.00"
            />
          </Field>

          <Field label="Duração (dias)" name="durationDays" errors={errors?.durationDays}>
            <Input
              name="durationDays"
              type="number"
              min="1"
              max="90"
              required
              defaultValue={initial?.durationDays ?? ""}
            />
          </Field>

          <Field label="Cidade de saída" name="departureCity" errors={errors?.departureCity}>
            <Input
              name="departureCity"
              required
              defaultValue={initial?.departureCity ?? ""}
              placeholder="São Paulo"
            />
          </Field>
        </div>

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
          />
        </Field>

        {cover && (
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
      </section>

      <section className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
        <Field
          label="O que está incluso"
          name="included"
          hint="Um item por linha."
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
          hint="Um item por linha."
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
