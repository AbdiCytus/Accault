// components/ImportModal.tsx
"use client";

import { useState, useRef } from "react";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { importAccounts } from "@/actions/import-export";
import type { ImportRowData } from "@/types/import-export";
import Portal from "./Portal";

// FIX 2 & 3: Definisi tipe untuk baris Excel yang mentah
interface ExcelRawRow {
  // Variasi Platform
  platformName?: string;
  PlatformName?: string;
  Platform?: string;
  Name?: string;
  // Variasi Username
  username?: string;
  Username?: string;
  User?: string;
  // Variasi Password
  password?: string;
  Password?: string;
  // Variasi Email
  email?: string;
  Email?: string;
  // Variasi Group
  group?: string;
  Group?: string;
  Folder?: string;
  // Variasi Categories
  categories?: string;
  Categories?: string;
  Category?: string;
  // Variasi Website
  website?: string;
  Website?: string;
  Url?: string;
  // Variasi Desc
  description?: string;
  Description?: string;
  Notes?: string;

  // Index signature untuk menangani kolom lain yang tidak dikenal
  [key: string]: unknown;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
};

export default function ImportModal({ isOpen, onClose, groupId }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const rawData = e.target?.result;
        let parsedData: ImportRowData[] = [];

        if (file.name.endsWith(".json")) {
          // Parse JSON
          const json = JSON.parse(rawData as string);
          if (!Array.isArray(json))
            throw new Error("Format JSON harus berupa Array");
          // Kita asumsikan JSON sudah sesuai format ImportRowData, atau kita cast
          parsedData = json as ImportRowData[];
        } else {
          // Parse Excel/CSV
          const workbook = XLSX.read(rawData, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // FIX 2: Gunakan Generic Type pada sheet_to_json
          const jsonData = XLSX.utils.sheet_to_json<ExcelRawRow>(sheet);

          // FIX 3: Mapping Data dengan tipe yang sudah didefinisikan (Tanpa 'any')
          parsedData = jsonData.map((row) => ({
            platformName: String(
              row.platformName ||
                row.PlatformName ||
                row.Platform ||
                row.Name ||
                ""
            ),
            username: String(row.username || row.Username || row.User || ""),
            password: row.password
              ? String(row.password)
              : row.Password
              ? String(row.Password)
              : undefined,
            email: row.email
              ? String(row.email)
              : row.Email
              ? String(row.Email)
              : undefined,
            group: row.group
              ? String(row.group)
              : row.Group
              ? String(row.Group)
              : row.Folder
              ? String(row.Folder)
              : undefined,
            categories: row.categories
              ? String(row.categories)
              : row.Categories
              ? String(row.Categories)
              : row.Category
              ? String(row.Category)
              : undefined,
            website: row.website
              ? String(row.website)
              : row.Website
              ? String(row.Website)
              : row.Url
              ? String(row.Url)
              : undefined,
            description: row.description
              ? String(row.description)
              : row.Description
              ? String(row.Description)
              : row.Notes
              ? String(row.Notes)
              : undefined,
          }));
        }

        if (parsedData.length === 0) {
          toast.error("File kosong atau format tidak terbaca.");
          setIsLoading(false);
          return;
        }

        const result = await importAccounts(parsedData, groupId);

        if (result.success) {
          toast.success(result.message);
          onClose();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Gagal membaca file. Pastikan format valid.");
      } finally {
        setIsLoading(false);
      }
    };

    if (file.name.endsWith(".json")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Import Akun
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
              ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }
            `}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, .xlsx, .xls, .json"
                onChange={(e) =>
                  e.target.files && processFile(e.target.files[0])
                }
              />

              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Sedang memproses...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mb-3">
                    <ArrowUpTrayIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Klik atau Drag & Drop file di sini
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mendukung: .xlsx, .csv, .json
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex gap-3 items-start">
              <DocumentTextIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Kolom Wajib:
                  </span>{" "}
                  platformName, username
                </p>
                <p>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Kolom Opsional:
                  </span>{" "}
                  password, email, group, categories (pisah koma), website,
                  description
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
