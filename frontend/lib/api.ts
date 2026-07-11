import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ImportPayload {
  csvData: Record<string, string>[];
  fileName: string;
}

export interface ImportResponse {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  records: any[];
  errors?: string[];
}

export const importCsv = async (payload: ImportPayload): Promise<ImportResponse> => {
  try {
    const response = await api.post<ImportResponse>('/api/import', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message || 'Import failed');
    }
    throw error;
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
};

export default api;
