"use client";

import { useActionState, useEffect, useRef } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { Field, FormError, Input, SubmitButton } from "./form-ui";
import { createDeparture, deleteDeparture } from "@/app/admin/(painel)/saidas/actions";
import { formatLongDate, formatPrice, formatShortDate } from "@/lib/format";
import type { FormState } from "@/lib/form";

export type DepartureRow = {
  id: number;
  departureDate: Date;
  returnDate: Date;
  spotsTotal: number;
  spotsAvailable: number;
  price: string | null;
  /** Calculado no servidor: `Date.now()` durante render quebra as regras de pureza. */
  isPast: boolean;
};

export function DepartureManager({
  packageId,
  departures,
  basePrice,
}: {
  packageId: number;
  departures: DepartureRow[];
  basePrice: string | null;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(createDeparture, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;

  // Limpa o formulário só quando o envio deu certo (a action devolve
  // undefined no sucesso e um objeto de erros na falha).
  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="packageId" value={packageId} />
        <FormError message={state?.error} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Saída" name="departureDate" errors={errors?.departureDate}>
            <Input name="departureDate" type="date" required />
          </Field>
          <Field label="Retorno" name="returnDate" errors={errors?.returnDate}>
            <Input name="returnDate" type="date" required />
          </Field>
          <Field
            label="Total de vagas"
            name="spotsTotal"
            hint="Opcional"
            errors={errors?.spotsTotal}
          >
            <Input name="spotsTotal" type="number" min="0" placeholder="0" />
          </Field>
          <Field
            label="Vagas livres"
            name="spotsAvailable"
            hint="Opcional"
            errors={errors?.spotsAvailable}
          >
            <Input name="spotsAvailable" type="number" min="0" placeholder="0" />
          </Field>
          <Field
            label="Preço da data"
            name="price"
            hint={basePrice ? `Vazio = ${formatPrice(basePrice)}` : "Opcional"}
            errors={errors?.price}
          >
            <Input name="price" type="number" step="0.01" min="0" placeholder="opcional" />
          </Field>
        </div>

        <div>
          <SubmitButton>
            <span className="flex items-center gap-2">
              <CalendarPlus className="size-4" />
              Adicionar data
            </span>
          </SubmitButton>
        </div>
      </form>

      {departures.length === 0 ? (
        <p className="rounded-xl bg-background px-4 py-6 text-center text-sm text-muted">
          Nenhuma data cadastrada. Sem datas, o pacote aparece no site sem opção de reserva.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl bg-background">
          {departures.map((d) => {
            return (
              <li
                key={d.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-3 ${d.isPast ? "opacity-50" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatLongDate(d.departureDate)}
                    <span className="font-normal text-muted">
                      {" → "}
                      {formatShortDate(d.returnDate)}
                    </span>
                    {d.isPast && <span className="ml-2 text-xs text-muted">(passada)</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {/* Total zero significa "ainda não definido", não esgotado. */}
                    {d.spotsTotal === 0
                      ? "vagas a definir"
                      : `${d.spotsAvailable}/${d.spotsTotal} vagas`}
                    {d.price ? ` · ${formatPrice(d.price)}` : ""}
                  </p>
                </div>
                <form action={deleteDeparture}>
                  <input type="hidden" name="id" value={d.id} />
                  <button
                    type="submit"
                    title="Remover data"
                    className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
