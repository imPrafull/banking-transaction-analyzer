
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly STORAGE_KEY = 'banking_transactions';
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor() {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      this.transactionsSubject.next(JSON.parse(storedData));
    }
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  getTransactionsSnapshot(): Transaction[] {
    return this.transactionsSubject.getValue();
  }

  getTransactionById(id: string): Observable<Transaction | undefined> {
    return this.transactions$.pipe(
      map(transactions => transactions.find(t => t.id === id))
    );
  }

  updateTransaction(updatedTransaction: Transaction): void {
    const currentTransactions = this.getTransactionsSnapshot();
    const index = currentTransactions.findIndex(t => t.id === updatedTransaction.id);
    if (index > -1) {
      const newTransactions = [...currentTransactions];
      newTransactions[index] = updatedTransaction;
      this.updateTransactions(newTransactions);
    }
  }

  deleteTransaction(id: string): void {
    const currentTransactions = this.getTransactionsSnapshot();
    const newTransactions = currentTransactions.filter(t => t.id !== id);
    this.updateTransactions(newTransactions);
  }

  private updateTransactions(transactions: Transaction[]): void {
    this.transactionsSubject.next(transactions);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
  }
  
  parseCsv(file: File): Observable<{ progress: number; data?: Transaction[]; error?: string }> {
    const SIMULATE_LARGE_FILE = false; // set to true to simulate large file parsing
    const DELAY_MS = SIMULATE_LARGE_FILE ? 300 : 0;
    const CHUNK_SIZE = SIMULATE_LARGE_FILE ? 1024 * 50 : 1024 * 1024 * 2; // 50 KB or 2 MB per chunk

    return new Observable(observer => {
      const totalSize = file.size;
      let offset = 0;
      const reader = new FileReader();
      const transactions: Transaction[] = [];
      let leftover = ''; // holds partial line between chunks
      let headers: string[] | null = null;

      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      const readNextChunk = async () => {
        if (offset >= totalSize) {
          try {
            this.updateTransactions(transactions);
            observer.next({ progress: 100, data: transactions });
            observer.complete();
          } catch (error) {
            observer.next({ progress: 100, error: 'Local Storage quota exceeded.' });
            observer.complete();
          }
          return;
        }

        // simulate slower chunk reading
        if (SIMULATE_LARGE_FILE) await delay(DELAY_MS); // add artificial delay per chunk

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsText(slice);
      };

      reader.onload = async () => {
        try {
          const text = leftover + (reader.result as string);
          const lines = text.split(/\r?\n/);
  
          // If the last line is incomplete, keep it for next chunk
          leftover = lines.pop() || '';
  
          // Process lines
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
  
            if (!headers) {
              headers = this.parseCsvLine(line);
              continue;
            }
  
            const values = this.parseCsvLine(line);
            if (values.length !== headers.length) continue;
  
            const headerMap = headers.map(h => h.toLowerCase());
            const amountIndex = headerMap.indexOf('amount');
            const typeIndex = headerMap.indexOf('transaction type');
  
            const amount = parseFloat(values[amountIndex]);
            if (isNaN(amount)) continue;
  
            // Normalize transaction type case-insensitively and validate
            const rawType = values[typeIndex]?.trim() || '';
            const typeLower = rawType.toLowerCase();
            if (typeLower !== 'credit' && typeLower !== 'debit') continue;
            const normalizedType = typeLower === 'credit' ? 'Credit' : 'Debit';
  
            transactions.push({
              id: values[headerMap.indexOf('transaction id')]?.trim() || this.generateId(),
              date: values[headerMap.indexOf('date')]?.trim(),
              description: values[headerMap.indexOf('description')]?.trim(),
              amount,
              type: normalizedType as 'Credit' | 'Debit',
              accountNumber: values[headerMap.indexOf('account number')]?.trim(),
            });
// ...existing code...
  
            // optional tiny delay for simulating parsing time
            // if (i % 100 === 0) await delay(50);
          }
  
  
          offset += CHUNK_SIZE;
          const progress = Math.min(99, Math.round((offset / totalSize) * 100));
          observer.next({ progress });
  
          setTimeout(readNextChunk, 0); // Schedule next chunk
        } catch (error) {
          console.error('Error parsing CSV:', error);
          observer.next({ progress: 100, error: 'An unexpected error occurred while parsing the file.' });
          observer.complete();
        }
      };

      reader.onerror = () => {
        observer.next({ progress: 100, error: 'Error reading file.' });
        observer.complete();
      };

      readNextChunk(); // Start reading
    });
}

private parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      // Escaped double quote ""
      current += '"';
      i++;
    } else if (char === '"') {
      // Toggle in/out of quotes
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push last field
  result.push(current.trim());
  return result;
}

// parse csv without chunking (original implementation)
// parseCsv(file: File): Observable<{ progress: number; data?: Transaction[]; error?: string }> {
//   return new Observable(observer => {
//     const reader = new FileReader();

//     reader.onload = (e: ProgressEvent<FileReader>) => {
//       try {
//         const text = e.target?.result as string;
//         if (!text) {
//           observer.next({ progress: 100, error: 'File is empty or could not be read.' });
//           observer.complete();
//           return;
//         }

//         const lines = text.trim().split(/\r\n|\n/);
//         if (lines.length < 2) {
//           observer.next({ progress: 100, error: 'CSV file must have a header and at least one data row.' });
//           observer.complete();
//           return;
//         }

//         const headerLine = lines.shift()!;
//         const headers = headerLine.split(',').map(h => h.trim());
        
//         const requiredHeaders = ['Transaction ID', 'Date', 'Description', 'Amount', 'Transaction Type', 'Account Number'];
//         const headersLowercase = headers.map(h => h.toLowerCase());
//         const missingHeaders = requiredHeaders.filter(rh => !headersLowercase.includes(rh.toLowerCase()));
//         if (missingHeaders.length > 0) {
//           observer.next({ progress: 100, error: `CSV missing required headers: ${missingHeaders.join(', ')}` });
//           observer.complete();
//           return;
//         }

//         const idIndex = headersLowercase.indexOf('transaction id');
//         const dateIndex = headersLowercase.indexOf('date');
//         const descriptionIndex = headersLowercase.indexOf('description');
//         const amountIndex = headersLowercase.indexOf('amount');
//         const typeIndex = headersLowercase.indexOf('transaction type');
//         const accountIndex = headersLowercase.indexOf('account number');

//         const transactions: Transaction[] = [];
//         const totalLines = lines.length;

//         for (let i = 0; i < totalLines; i++) {
//           const line = lines[i];
//           if (!line.trim()) continue; // Skip empty lines

//           const values = line.split(','); // Simple CSV parsing, assumes no commas in values

//           const amount = parseFloat(values[amountIndex]);
//           if (isNaN(amount)) {
//               console.warn(`Skipping row ${i+2} due to invalid amount: ${values[amountIndex]}`);
//               continue;
//           }
          
//           const transactionType = values[typeIndex]?.trim();
//           if (transactionType !== 'Credit' && transactionType !== 'Debit') {
//               console.warn(`Skipping row ${i+2} due to invalid transaction type: ${transactionType}`);
//               continue;
//           }

//           transactions.push({
//             id: values[idIndex]?.trim() || this.generateId(),
//             date: values[dateIndex]?.trim(),
//             description: values[descriptionIndex]?.trim(),
//             amount: amount,
//             type: transactionType as 'Credit' | 'Debit',
//             accountNumber: values[accountIndex]?.trim()
//           });

//           // Report progress periodically
//           if ((i + 1) % 10 === 0 || (i + 1) === totalLines) {
//             const progress = Math.round(((i + 1) / totalLines) * 100);
//             observer.next({ progress });
//           }
//         }
        
//         this.updateTransactions(transactions);
//         observer.next({ progress: 100, data: transactions });
//         observer.complete();

//       } catch (error) {
//         console.error('Error parsing CSV:', error);
//         observer.next({ progress: 100, error: 'An unexpected error occurred while parsing the file.' });
//         observer.complete();
//       }
//     };

//     reader.onerror = (error) => {
//       console.error('Error reading file:', error);
//       observer.next({ progress: 100, error: 'Failed to read the file.' });
//       observer.complete();
//     };
    
//     reader.readAsText(file);
//   });
// }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}