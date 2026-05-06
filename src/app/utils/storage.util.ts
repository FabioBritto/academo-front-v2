export function formatBytes(value: number | null | undefined): string {
  if (value == null) {
    return '-';
  }

  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '-';
  }

  const base = 1024;

  if (bytes < base) {
    return `${Math.floor(bytes)} B`;
  }

  const kb = bytes / base;
  if (kb < base) {
    return `${kb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KB`;
  }

  const mb = kb / base;
  if (mb < base) {
    return `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
  }

  const gb = mb / base;
  return `${gb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} GB`;
}
