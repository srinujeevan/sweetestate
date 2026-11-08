/**
 * Builds RFC 4180 CSV. Cells beginning with = + - @ (or tab/CR) are prefixed
 * with an apostrophe so spreadsheet apps don't execute them as formulas
 * (CSV/formula injection).
 */
export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','));
  return lines.join('\r\n');
}

export function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}
