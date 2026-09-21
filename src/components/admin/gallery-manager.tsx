"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { FormError, SubmitButton } from "./form-ui";
import {
  addPackageImages,
  removePackageImage,
  updateImageAlt,
} from "@/app/admin/(painel)/pacotes/actions";
import type { FormState } from "@/lib/form";

export type GalleryImage = { id: number; url: string; alt: string };

export function GalleryManager({
  packageId,
  images,
}: {
  packageId: number;
  images: GalleryImage[];
}) {
  const action = addPackageImages.bind(null, packageId);
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <FormError message={state?.error} />

        <input
          type="file"
          name="fotos"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="block w-full max-w-md text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
        />
        <p className="text-xs text-muted">
          Dá para escolher várias de uma vez. JPG, PNG, WebP, GIF ou AVIF, até 8 MB cada.
        </p>

        <div>
          <SubmitButton>
            <span className="flex items-center gap-2">
              <ImagePlus className="size-4" />
              Enviar fotos
            </span>
          </SubmitButton>
        </div>
      </form>

      {images.length === 0 ? (
        <p className="rounded-xl bg-background px-4 py-6 text-center text-sm text-muted">
          Nenhuma foto na galeria. A capa do pacote continua aparecendo normalmente.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <form action={removePackageImage} className="absolute right-2 top-2">
                  <input type="hidden" name="id" value={img.id} />
                  <button
                    type="submit"
                    title="Remover foto"
                    className="rounded-lg bg-white/90 p-1.5 text-red-700 shadow transition hover:bg-white"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>

              {/* A descrição é o que leitores de tela leem. Fica opcional e
                  editável aqui, em vez de barrar o envio da foto. */}
              <form action={updateImageAlt} className="flex gap-2 p-2">
                <input type="hidden" name="id" value={img.id} />
                <input
                  name="alt"
                  defaultValue={img.alt}
                  placeholder="Descreva a foto (opcional)"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none transition focus:border-brand"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-brand-light hover:text-brand-dark"
                >
                  Salvar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
