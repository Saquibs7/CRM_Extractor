"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { parseCSV, validateCSV } from "@/lib/csv-parser";
import { useImportStore } from "@/lib/store";

interface FileUploaderProps {
  onComplete: () => void;
}

export function FileUploader({ onComplete }: FileUploaderProps) {
  const { setCsvData, setFileName } = useImportStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please upload a valid CSV file");
        return;
      }

      try {
        const parsed = await parseCSV(file);

        if (parsed.error) {
          toast.error(`CSV parsing error: ${parsed.error}`);
          return;
        }

        if (!validateCSV(parsed.headers, parsed.data)) {
          toast.error("CSV file appears to be empty or invalid");
          return;
        }

        setCsvData(parsed.data, parsed.headers);
        setFileName(file.name);
        toast.success(`Loaded ${parsed.data.length} records from ${file.name}`);
        onComplete();
      } catch (error) {
        toast.error("Failed to process file");
        console.error(error);
      }
    },
    [setCsvData, setFileName, onComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const features = [
    { title: "AI Column Mapping", description: "Smart field inference across mixed CSV layouts.", icon: Sparkles },
    { title: "Duplicate Detection", description: "Keep your CRM clean with intelligent row checks.", icon: ShieldCheck },
    { title: "Smart Validation", description: "Auto-detect missing contact data and invalid entries.", icon: CheckCircle2 },
    { title: "Bulk Import", description: "Scale from a handful of rows to thousands in one flow.", icon: Database },
    { title: "Fast Processing", description: "Batch handling with reliable retries and progress feedback.", icon: Zap },
    { title: "Automatic Field Recognition", description: "Supports Meta Ads, Google Ads, HubSpot, and Excel exports.", icon: UsersRound },
  ];

  const platforms = ["HubSpot", "Salesforce", "Meta Ads", "Google Ads", "Excel"];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300">
          <FileSpreadsheet className="mr-2 h-4 w-4 text-zinc-600" />
          Import Contacts
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Upload a CSV and turn messy lead data into a CRM-ready pipeline.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          Drop in your export, review the preview, and process records with the same workflow your team already uses.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] dark:border-[#2a2d33] dark:bg-[#18181b] sm:p-8">
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-2xl border border-dashed p-8 text-center transition-all duration-200 sm:p-10 ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-white dark:border-[#2a2d33] dark:bg-[#121417]/70 dark:hover:border-zinc-500 dark:hover:bg-[#1f2937]"
            }`}
          >
            <input {...getInputProps()} />

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-600">
              <FileSpreadsheet className="h-7 w-7" />
            </div>

            {isDragActive ? (
              <>
                <h3 className="text-xl font-semibold text-zinc-600">Drop your CSV here</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Release to upload the file.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Drag & drop CSV</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Browse your computer or drop a file to begin the import.
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700"
                >
                  Browse files
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Supported:</span>
            {platforms.map((platform) => (
              <span key={platform} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300">
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] dark:border-[#2a2d33] dark:bg-[#18181b]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent Imports</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">No uploads yet</h3>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-[#2a2d33] dark:bg-[#121417] dark:text-slate-400">
              Ready
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {["Facebook leads", "Google Ads", "Excel export"].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-[#2a2d33] dark:bg-[#121417]">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Example format {index + 1}</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a2d33] dark:bg-[#18181b]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-zinc-600 dark:border-[#2a2d33] dark:bg-[#121417]">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">{feature.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
