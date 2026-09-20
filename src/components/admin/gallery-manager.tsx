"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { Field, FormError, Input, SubmitButton } from "./form-ui";
import { addPackageImage, removePackageImage } from "@/app/admin/(painel)/pacotes/actions";
import { ALLOWED_IMAGE_HOSTS, type FormState } from "@/lib/form";

export type GalleryImage = { id: number; url: string; alt: string };

export function GalleryManager({
  packageId,
  images,
}: {
  packageId: number;
  images: GalleryImage[];
}) {
  const action = addPackageImage.bind(null, packageId);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;

  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <FormError message={state?.error} />
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field
            label="URL da foto"
            name="url"
            hint={`Somente https de: ${ALLOWED_IMAGE_HOSTS.join(", ")}`}
            errors={errors?.url}
          >
            <Input name="url" required placeholder="https://images.unsplash.com/photo-..." />
          </Field>
          <Field
            label="Descrição da foto"
            name="alt"
            hint="Lida por leitores de tela."
            errors={errors?.alt}
          >
            <Input name="alt" required placeholder="Cachoeira vista de cima" />
          </Field>
        </div>
        <div>
          <SubmitButton>
            <span className="flex items-center gap-2">
              <ImagePlus className="size-4" />
              Adicionar foto
            </span>
          </SubmitButton>
        </div>
      </form>

      {images.length === 0 ? (
        <p className="rounded-xl bg-background px-4 py-6 text-center text-sm text-muted">
          Nenhuma foto na galeria. A capa do pacote continua aparecendo normalmente.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
              <form
                action={removePackageImage}
                className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100"
              >
                <input type="hidden" name="id" value={img.id} />
                <button
                  type="submit"
                  title="Remover foto"
                  className="rounded-lg bg-white/90 p-1.5 text-red-700 shadow transition hover:bg-white"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
