
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  accountNumber: string;
}
