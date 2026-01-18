// components/dashboard/SearchInput.tsx
"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 1. Gunakan State untuk mengontrol nilai input secara langsung
  const [inputValue, setInputValue] = useState(
    searchParams.get("q")?.toString() || "",
  );

  // 2. Tambahkan Effect untuk sinkronisasi URL -> Input
  // Ini yang akan mereset input saat tombol "Clear Search" diklik di luar komponen ini
  useEffect(() => {
    const queryInUrl = searchParams.get("q")?.toString() || "";
    setInputValue(queryInUrl);
  }, [searchParams]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    const currentTab = searchParams.get("tab");
    if (currentTab) params.set("tab", currentTab);

    if (term) params.set("q", term);
    else params.delete("q");

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // 3. Handler Change Lokal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Update tampilan input seketika (agar tidak lag)
    handleSearch(value); // Jalankan debounce untuk update URL
  };

  return (
    <div className="w-full sm:w-64 lg:w-80">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          id="dashboard-search-input"
          type="text"
          placeholder="Search..."
          // Ubah dari defaultValue menjadi value (Controlled)
          value={inputValue}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none">
          <kbd className="hidden sm:inline-block px-1.5 h-5 text-[10px] leading-5 font-mono font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
            CTRL + K
          </kbd>
        </div>
      </div>
    </div>
  );
}
