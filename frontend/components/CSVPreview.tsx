"use client";

import { FileCheck2, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useImportStore } from "@/lib/store";
import { DataTable } from "./DataTable";

interface CSVPreviewProps {
  onConfirm: () => void;
  onBack: () => void;
}

export function CSVPreview({ onConfirm, onBack }: CSVPreviewProps) {
  const { csvData, headers, fileName } = useImportStore();

  const stats = useMemo(() => {
    return {
      totalRows: csvData.length,
      totalColumns: headers.length,
      fileName,
    };
  }, [csvData, headers, fileName]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Review your data</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Preview before processing
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              The import will use your current CSV layout and map the columns into CRM-ready fields.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700">
            <Sparkles className="h-4 w-4" />
            AI mapping ready
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2a2d33] dark:bg-[#18181b]">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">File</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{stats.fileName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2a2d33] dark:bg-[#18181b]">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rows</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{stats.totalRows.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2a2d33] dark:bg-[#18181b]">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Columns</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{stats.totalColumns}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2a2d33] dark:bg-[#121417]">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <FileCheck2 className="h-4 w-4 text-zinc-600" />
            Previewing the first rows. Confirm the import when you are ready to process the file.
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b]">
        <DataTable headers={headers} data={csvData.slice(0, 50)} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700"
        >
          Confirm & Process
        </button>
      </div>
    </div>
  );
}
