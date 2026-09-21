"use client";

import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";

type Props = {
  /** Nome base. O contrato de campos está em `resolveImageField`. */
  name: string;
  label: string;
  current?: string | null;
  hint?: string;
  errors?: string[];
};

export function ImageField({ name, label, current, hint, errors }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [removed, setRemoved] = useState(false);

  function pick(file: File | undefined) {
    if (!file) return;
    // URL local só para a prévia; o upload acontece ao salvar o formulário.
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
  }

  function remove() {
    setPreview(null);
    setRemoved(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>

      <input type="hidden" name={`${name}Atual`} value={current ?? ""} />
      <input type="hidden" name={`${name}Remover`} value={removed ? "1" : ""} />

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-alt">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-muted">
              <ImageUp className="size-6" strokeWidth={1.5} />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => pick(e.target.files?.[0])}
            className="block w-full max-w-xs text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
          />

          {preview && (
            <button
              type="button"
              onClick={remove}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-3.5" />
              Remover imagem
            </button>
          )}

          <p className="text-xs text-muted">{hint ?? "JPG, PNG, WebP, GIF ou AVIF, até 8 MB."}</p>
        </div>
      </div>

      {errors?.map((e) => (
        <p key={e} className="text-xs font-medium text-red-600">
          {e}
        </p>
      ))}
    </div>
  );
}
