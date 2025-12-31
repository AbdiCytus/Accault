// components/HeaderActionMenu.tsx
"use client";

import { useState } from "react";
import {
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/solid";
import Tooltip from "@/components/ui/Tooltip";
import ImportModal from "./ImportModal";
import { getExportData } from "@/actions/import-export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

type Props = {
  variant: "dashboard" | "group" | "account"; // Tambah 'account'
  scope: "all" | "group" | "single";
  id?: string;
};

export default function HeaderActionMenu({ variant, scope, id }: Props) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);

  // --- HANDLER EXPORT ---
  const handleExport = async (format: "json" | "excel") => {
    setIsExportLoading(true);
    try {
      const result = await getExportData(scope, id);

      if (!result.success || !result.data || result.data.length === 0) {
        toast.error(result.message || "Tidak ada data.");
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `export-${scope}-${timestamp}`;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        saveAs(blob, `${fileName}.json`);
      } else {
        const worksheet = XLSX.utils.json_to_sheet(result.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
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
      toast.error("Gagal export");
    } finally {
      setIsExportLoading(false);
    }
  };

  // Helper untuk memilih ikon trigger berdasarkan varian
  const getTriggerIcon = () => {
    if (variant === "dashboard")
      return <EllipsisVerticalIcon className="w-6 h-6" />;
    if (variant === "group") return <DocumentTextIcon className="w-6 h-6" />;
    return <DocumentTextIcon className="w-6 h-6" />; // Icon untuk Account Detail
  };

  return (
    <>
      <div className="relative group z-40">
        {/* --- 1. PARENT ICON (Trigger) --- */}
        <button className="flex items-center justify-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm">
          {getTriggerIcon()}
        </button>

        {/* --- 2. DROPDOWN CONTAINER --- */}
        <div className="absolute right-0 top-full pt-1.5 hidden group-hover:flex flex-col items-end animate-in fade-in slide-in-from-top-1 duration-200">
          {/* --- 3. ACTUAL MENU BOX --- */}
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-1 w-max">
            {/* ITEM 1: IMPORT (Hanya tampil jika BUKAN akun satuan) */}
            {variant !== "account" && (
              <Tooltip text="Import" position="right">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors flex items-center justify-center">
                  <ArrowUpTrayIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            )}

            {/* ITEM 2: EXPORT OPTIONS */}
            <div className="relative group/export">
              <Tooltip text="Export" position="right">
                <button
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center w-full
                        ${
                          isExportLoading
                            ? "animate-pulse text-gray-400"
                            : "hover:bg-green-50 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                        }`}>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
              </Tooltip>

              {/* SUBMENU EXPORT (Kiri) */}
              <div className="absolute right-full top-0 pr-2 hidden group-hover/export:flex items-start">
                <div className="flex flex-col gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 w-32 animate-in fade-in slide-in-from-right-2">
                  <button
                    onClick={() => handleExport("excel")}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 rounded transition-colors text-left">
                    <TableCellsIcon className="w-4 h-4" /> Excel
                  </button>
                  <button
                    onClick={() => handleExport("json")}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-700 rounded transition-colors text-left">
                    <CodeBracketIcon className="w-4 h-4" /> JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL IMPORT */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        groupId={scope === "group" ? id : undefined}
      />
    </>
  );
}
