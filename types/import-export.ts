// types/import-export.ts

export interface AccountExportData {
  platformName: string;
  username: string;
  password?: string | null;
  email?: string | null;
  group?: string | null;
  categories: string;
  website?: string | null;
  description?: string | null;
}

export type EmailExportData = {
  Name: string | null;
  Email: string;
  "Phone Number": string;
  "2FA Enabled": string;
  Verified: string;
  "Recovery Email": string;
  "Total Accounts": number;
};

export type ExportResult = AccountExportData | EmailExportData;

export interface ImportRowData {
  platformName: string;
  username: string;
  password?: string;
  email?: string;
  group?: string;
  categories?: string;
  website?: string;
  description?: string;
}
