export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-6);
  return `ORD-${year}-${suffix.padStart(6, "0")}`;
}

export function generateCode(prefix: string): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${year}-${rand}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
