export type CsvRow = Record<string, string>;

export function parseCsv(content: string): { headers: string[]; rows: CsvRow[] } {
  const lines = splitCsvLines(content.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const rows: CsvRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);
    if (values.every((value) => !value.trim())) {
      continue;
    }

    const row: CsvRow = {};
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      const header = headers[columnIndex];
      if (!header) {
        continue;
      }
      row[header] = values[columnIndex]?.trim() ?? "";
    }
    rows.push(row);
  }

  return { headers, rows };
}

function splitCsvLines(content: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
        current += '"';
      }
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      lines.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || content.endsWith("\n") || content.endsWith("\r")) {
    lines.push(current);
  }

  return lines;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function getMappedValue(row: CsvRow, headerName?: string): string {
  if (!headerName) {
    return "";
  }
  return row[headerName]?.trim() ?? "";
}
