// acc-man/components/menu/ImportExportMenu.tsx
"use client";

import { useState } from "react";
import {
  TableCellsIcon,
  CodeBracketIcon,
  CloudIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "@/components/ui/Tooltip";
import ImportModal from "../modals/ImportModal";
import { getExportData } from "@/actions/import-export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

type Props = {
  // Tambahkan variant 'emails_tab' dan scope 'emails'
  variant: "dashboard" | "group" | "account" | "emails_tab";
  scope: "all" | "group" | "single" | "emails";
  id?: string;
};

export default function ImportExportMenu({ variant, scope, id }: Props) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);

  const handleExport = async (format: "json" | "excel") => {
    setIsExportLoading(true);
    try {
      const result = await getExportData(scope, id);

      if (!result.success || !result.data || result.data.length === 0) {
        toast.error(result.message || "No Data Found For Export");
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${fileName}.xlsx`);
      }
      toast.success("Export Success!");
    } catch (error) {
      console.error(error);
      toast.error("Export Failed!");
    } finally {
      setIsExportLoading(false);
    }
  };

  // Cek apakah Import diperbolehkan (Tidak boleh di tab email)
  const canImport = variant !== "account" && variant !== "emails_tab";

  return (
    <>
      <div className="relative group z-40">
        <button className="flex items-center justify-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm">
          <CloudIcon className="w-6 h-6" />
        </button>

        <div className="absolute right-0 top-full pt-1.5 hidden group-focus-within:flex group-hover:flex flex-col items-end animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-1 w-max">
            {/* EXPORT OPTIONS (Selalu Muncul) */}
            <div className="relative group/export">
              <Tooltip text="Export" position="right">
                <button
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center w-full ${
                    isExportLoading
                      ? "animate-pulse text-gray-400"
                      : "hover:bg-green-50 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                  }`}>
                  <CloudArrowUpIcon className="w-5 h-5" />
                </button>
              </Tooltip>

              <div className="absolute right-full top-0 pr-2 hidden group-focus-within/export:flex group-hover/export:flex items-start">
                <div className="flex flex-col gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 w-32 animate-in fade-in slide-in-from-right-2">
                  <button
                    onClick={() => handleExport("excel")}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-lime-500 hover:text-green-700 rounded transition-colors text-left">
                    <TableCellsIcon className="w-4 h-4" /> Excel
                  </button>
                  <button
                    onClick={() => handleExport("json")}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 dark:hover:text-amber-500 hover:text-yellow-700 rounded transition-colors text-left">
                    <CodeBracketIcon className="w-4 h-4" /> JSON
                  </button>
                </div>
              </div>
            </div>

            {/* IMPORT OPTION (Kondisional) */}
            {canImport && (
              <Tooltip text="Import" position="right">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors flex items-center justify-center">
                  <CloudArrowDownIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        groupId={scope === "group" ? id : undefined}
      />
    </>
  );
}
