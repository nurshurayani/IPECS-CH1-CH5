export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  source: "manual" | "ocr";
  flagged?: boolean;
}

export interface Budget {
  [category: string]: number;
}

export interface Alert {
  id: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  severity: "High" | "Medium" | "Low";
  dismissed: boolean;
}

export interface UserProfile {
  name: string;
  university: string;
  studentId: string;
  age: number;
  allowanceRange: string;
}

export interface AdminUser {
  userId: string;
  name: string;
  institution: string;
  age: number;
  plan: "Free" | "Pro";
  active: boolean;
  registeredDate: string;
  totalTransactions: number;
}

export interface AdminCategory {
  categoryName: string;
  colour: string;
  default: boolean;
  active: boolean;
}

export interface AdminTransaction {
  id: string;
  user: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  source: string;
  flagged: boolean;
}
