const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Sao_Paulo",
});

const longDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const monthYear = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatPrice(value: number | string | { toString(): string }) {
  return brl.format(Number(value.toString()));
}

export function formatShortDate(date: Date) {
  return shortDate.format(date).replace(".", "");
}

export function formatLongDate(date: Date) {
  return longDate.format(date);
}

export function formatMonthYear(date: Date) {
  const s = monthYear.format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDuration(days: number) {
  if (days <= 1) return "1 dia";
  return `${days} dias / ${days - 1} noite${days - 1 > 1 ? "s" : ""}`;
}
