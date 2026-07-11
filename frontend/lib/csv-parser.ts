import Papa from 'papaparse';

export interface ParsedCSV {
  data: Record<string, string>[];
  headers: string[];
  error?: string;
}

export const parseCSV = (file: File): Promise<ParsedCSV> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value?.trim() || '',
      error: (error: any) => {
        resolve({
          data: [],
          headers: [],
          error: error.message || 'Failed to parse CSV',
        });
      },
      complete: (results: any) => {
        const headers = results.meta.fields || [];
        const data = results.data || [];
        
        // Filter out empty rows
        const filteredData = data.filter((row: any) =>
          Object.values(row).some((val: any) => val && String(val).trim())
        );
        
        resolve({
          data: filteredData,
          headers,
        });
      },
    });
  });
};

export const validateCSV = (headers: string[], data: Record<string, string>[]): boolean => {
  if (!headers || headers.length === 0) return false;
  if (!data || data.length === 0) return false;
  return true;
};

export const downloadCSV = (data: any[], fileName: string = 'crm_records.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};
