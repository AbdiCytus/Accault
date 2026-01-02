// lib/dictionary.ts

export type Locale = "en" | "id";

export const dictionary = {
  en: {
    navbar: {
      dashboard: "Dashboard",
      about: "About",
      help: "Help",
      profile: "Profile",
      language: "Language",
      settings: "Settings",
      logout: "Sign Out",
      switchTo: "Switch to Indonesia",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Manage your digital accounts",
      addAccount: "Add Account",
      searchPlaceholder: "Search accounts...",
      filterGroup: "All Groups",
      import: "Import Data",
      export: "Export Data",
      emptyState: "No accounts found",
    },
    profile: {
      title: "My Profile",
      activity: "Recent Activity",
      chartTitle: "Account Distribution",
      stats: {
        accounts: "Total Accounts",
        groups: "Total Groups",
        emails: "Total Emails",
      },
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      confirm: "Confirm",
      loading: "Loading...",
    },
  },
  id: {
    navbar: {
      dashboard: "Dasbor",
      about: "Tentang",
      help: "Bantuan",
      profile: "Profil",
      language: "Bahasa",
      settings: "Pengaturan",
      logout: "Keluar",
      switchTo: "Ganti ke Inggris",
    },
    dashboard: {
      title: "Dasbor",
      subtitle: "Kelola akun digital Anda",
      addAccount: "Tambah Akun",
      searchPlaceholder: "Cari akun...",
      filterGroup: "Semua Grup",
      import: "Impor Data",
      export: "Ekspor Data",
      emptyState: "Tidak ada akun ditemukan",
    },
    profile: {
      title: "Profil Saya",
      activity: "Aktivitas Terbaru",
      chartTitle: "Distribusi Akun",
      stats: {
        accounts: "Total Akun",
        groups: "Total Grup",
        emails: "Total Email",
      },
    },
    common: {
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Ubah",
      confirm: "Konfirmasi",
      loading: "Memuat...",
    },
  },
};
