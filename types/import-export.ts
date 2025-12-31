// types/import-export.ts

export interface AccountExportData {
  platformName: string;
  username: string;
  password?: string | null; // Akan berisi encryptedPassword atau plain (jika didekripsi)
  email?: string | null; // String email dari relasi EmailIdentity
  group?: string | null; // Nama group dari relasi AccountGroup
  categories: string; // Disimpan sebagai string "Social, Work" untuk CSV
  website?: string | null;
  description?: string | null;
}

export interface ImportRowData {
  platformName: string;
  username: string;
  password?: string;
  email?: string;
  group?: string;
  categories?: string; // Input dari Excel biasanya string dipisah koma
  website?: string;
  description?: string;
}
