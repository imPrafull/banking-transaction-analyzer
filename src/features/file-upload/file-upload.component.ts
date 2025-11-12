
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  isDragOver = false;
  fileName: string | null = null;
  uploadProgress = 0;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.resetState();

    if (file.type !== 'text/csv') {
      this.errorMessage = 'Unsupported file format. Please upload a CSV file.';
      this.cdr.markForCheck();
      return;
    }

    this.fileName = file.name;
    this.transactionService.parseCsv(file).subscribe({
      next: (result) => {
        this.uploadProgress = result.progress;
        if (result.error) {
          this.errorMessage = result.error;
        }
        if (result.data) {
          this.successMessage = `Successfully parsed and stored ${result.data.length} transactions.`;
          setTimeout(() => this.router.navigate(['/transactions']), 500);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'An unexpected error occurred during file processing.';
        this.uploadProgress = 0;
        this.cdr.markForCheck();
      }
    });
  }

  private resetState(): void {
    this.fileName = null;
    this.uploadProgress = 0;
    this.errorMessage = null;
    this.successMessage = null;
  }
}
