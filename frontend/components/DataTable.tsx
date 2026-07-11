"use client";

import { Download, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { downloadCSV } from "@/lib/csv-parser";

interface DataTableProps {
  headers: string[];
  data: Record<string, any>[];
}

export function DataTable({ headers, data }: DataTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyPopulated, setShowOnlyPopulated] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const rowsPerPage = 10;

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return data.filter((row) => {
      const matchesSearch = normalizedTerm
        ? Object.values(row).some((value) => String(value || "").toLowerCase().includes(normalizedTerm))
        : true;
      const hasContent = Object.values(row).some((value) => String(value || "").trim().length > 0);
      const matchesFilter = !showOnlyPopulated || hasContent;
      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, showOnlyPopulated]);

  useEffect(() => {
    setActivePage(1);
  }, [searchTerm, showOnlyPopulated]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const startIndex = (activePage - 1) * rowsPerPage;
  const pageRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const truncateText = (text: string, maxLength: number = 48): string => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 dark:border-[#2a2d33] dark:bg-[#121417]/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search records"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyPopulated((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              showOnlyPopulated
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300 dark:hover:bg-[#23262b]"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => downloadCSV(filteredRows, "crm_records.csv")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300 dark:hover:bg-[#23262b]"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>

      {showLeftGradient && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-white to-transparent" />
      )}
      {showRightGradient && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white to-transparent" />
      )}

      <div ref={scrollContainerRef} className="max-h-[560px] overflow-x-auto" style={{ maxHeight: "560px" }}>
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border-b border-slate-200 bg-white px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  No matching rows found.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-slate-100 bg-white transition hover:bg-slate-50/80 dark:border-[#2a2d33] dark:bg-[#18181b] dark:hover:bg-[#23262b]/70">
                  {headers.map((header) => (
                    <td key={`${rowIdx}-${header}`} className="max-w-[220px] px-4 py-3 text-slate-600 whitespace-nowrap dark:text-slate-300" title={String(row[header] || "")}>
                      {truncateText(String(row[header] || ""), 50)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {filteredRows.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredRows.length)} of {filteredRows.length} rows
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage((value) => Math.max(1, value - 1))}
            disabled={activePage === 1}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-600 dark:border-[#2a2d33] dark:bg-[#121417] dark:text-slate-300">
            {activePage} / {totalPages}
          </span>
          <button
            onClick={() => setActivePage((value) => Math.min(totalPages, value + 1))}
            disabled={activePage === totalPages}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
