import { CRMRecord } from "../utils/crm-rules.js";

export interface ImportHistory {
  _id?: string;
  fileName: string;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  createdAt: Date;
  error?: string;
}

// In-memory storage for demo purposes
// In production, this would use MongoDB
const importHistoryStore: ImportHistory[] = [];

export async function saveImportHistory(history: ImportHistory): Promise<ImportHistory> {
  const record: ImportHistory = {
    ...history,
    _id: Date.now().toString(),
    createdAt: new Date(),
  };

  importHistoryStore.push(record);

  // Keep only last 100 imports in memory
  if (importHistoryStore.length > 100) {
    importHistoryStore.shift();
  }

  return record;
}

export async function getImportHistory(): Promise<ImportHistory[]> {
  return importHistoryStore;
}

export function processCSVRecords(
  records: Record<string, string>[],
  batchSize: number = 10
): Record<string, string>[][] {
  const batches: Record<string, string>[][] = [];

  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }

  return batches;
}

export function filterValidRecords(records: CRMRecord[]): CRMRecord[] {
  return records.filter((record) => {
    // Must have at least one contact method
    return record.email || record.mobile_without_country_code;
  });
}

export function generateCSVFromRecords(records: CRMRecord[]): string {
  if (records.length === 0) return "";

  const headers = [
    "created_at",
    "name",
    "email",
    "country_code",
    "mobile_without_country_code",
    "company",
    "city",
    "state",
    "country",
    "lead_owner",
    "crm_status",
    "crm_note",
    "data_source",
    "possession_time",
    "description",
  ];

  const rows = records.map((record) =>
    headers
      .map((header) => {
        const value = record[header as keyof CRMRecord] || "";
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
