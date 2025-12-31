// components/ExportMenu.tsx
"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { getExportData } from "@/actions/import-export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

type Props = {
  scope: "all" | "group" | "single";
  id?: string;
  label?: boolean;
};

export default function ExportMenu({ scope, id, label = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (format: "json" | "excel") => {
    setIsLoading(true);
    setIsOpen(false);

    try {
      const result = await getExportData(scope, id);

      if (!result.success || !result.data || result.data.length === 0) {
        toast.error(result.message || "Tidak ada data untuk diexport");
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `export-${scope}-${timestamp}`;

      if (format === "json") {
        // Export JSON
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        saveAs(blob, `${fileName}.json`);
      } else {
        // Export Excel
        const worksheet = XLSX.utils.json_to_sheet(result.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

        // Auto-width columns (opsional, untuk kerapian)
        const max_width = result.data.reduce(
          (w, r) => Math.max(w, r.platformName.length),
          10
        );
        worksheet["!cols"] = [{ wch: max_width }];

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${fileName}.xlsx`);
      }

      toast.success("Export berhasil!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan export");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border
            ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }
            ${
              label
                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                : "bg-transparent border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }
        `}
        title="Export Data">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ArrowDownTrayIcon className="w-4 h-4" />
        )}
        {/* {label && <span className="hidden sm:inline"></span>} */}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-1 animate-in zoom-in-95">
            <button
              onClick={() => handleExport("excel")}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors">
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport("json")}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-yellow-50 hover:text-yellow-700 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors">
              JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
