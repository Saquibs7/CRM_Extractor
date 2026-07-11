import { create } from "zustand";

export interface CSVRow {
  [key: string]: string;
}

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  records: any[];
  errors?: string[];
}

interface ImportStore {
  csvData: CSVRow[];
  headers: string[];
  fileName: string;
  importResults: ImportResult | null;
  isLoading: boolean;
  
  setCsvData: (data: CSVRow[], headers: string[]) => void;
  setFileName: (name: string) => void;
  setImportResults: (results: ImportResult) => void;
  setIsLoading: (loading: boolean) => void;
  resetStore: () => void;
}

export const useImportStore = create<ImportStore>((set) => ({
  csvData: [],
  headers: [],
  fileName: "",
  importResults: null,
  isLoading: false,

  setCsvData: (data, headers) => set({ csvData: data, headers }),
  setFileName: (name) => set({ fileName: name }),
  setImportResults: (results) => set({ importResults: results }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  resetStore: () => set({
    csvData: [],
    headers: [],
    fileName: "",
    importResults: null,
    isLoading: false,
  }),
}));
