"use client";

import { AlertTriangle, CheckCircle2, FileSpreadsheet, RefreshCw, Users2 } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { importCsv } from "@/lib/api";
import { useImportStore } from "@/lib/store";
import { DataTable } from "./DataTable";

interface ImportResultsProps {
  onRestart: () => void;
}

export function ImportResults({ onRestart }: ImportResultsProps) {
  const { csvData, fileName, importResults, setImportResults, isLoading, setIsLoading } = useImportStore();

  useEffect(() => {
    const performImport = async () => {
      try {
        setIsLoading(true);

        const response = await importCsv({
          csvData,
          fileName,
        });

        setImportResults(response);
        toast.success(`Successfully imported ${response.imported} records!`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Import failed";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!importResults && csvData.length > 0) {
      performImport();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-zinc-600 dark:border-[#2a2d33] dark:bg-[#121417]">
            <RefreshCw className="h-7 w-7 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Processing with AI</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Extracting and mapping CRM fields from your uploaded file.
          </p>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-[#374151]">
            <div className="h-full w-2/3 rounded-full bg-zinc-600 transition-all" />
          </div>
        </div>
      </div>
    );
  }

  if (!importResults) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b]">
        <p className="text-sm text-slate-600 dark:text-slate-400">No results available</p>
      </div>
    );
  }

  const CRMHeaders = [
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

  const successRate = importResults.total > 0 ? Math.round((importResults.imported / importResults.total) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Import complete</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              CRM-ready records extracted
            </h2>
          </div>
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#2a2d33] dark:bg-[#121417] dark:text-slate-300 dark:hover:bg-[#23262b]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Import another file
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileSpreadsheet className="h-4 w-4 text-zinc-600" />
              Total
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{importResults.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Imported
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{importResults.imported}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users2 className="h-4 w-4 text-amber-600" />
              Skipped
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{importResults.skipped}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-zinc-600" />
              Success
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{successRate}%</p>
          </div>
        </div>
      </div>

      {importResults.errors && importResults.errors.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">A few issues were encountered during import.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {importResults.errors.slice(0, 5).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b]">
        <div className="border-b border-slate-200 p-6 dark:border-[#2a2d33]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Extracted CRM records</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{importResults.records.length} successfully processed records</p>
        </div>
        <DataTable headers={CRMHeaders} data={importResults.records.slice(0, 50)} />
      </div>
    </div>
  );
}
