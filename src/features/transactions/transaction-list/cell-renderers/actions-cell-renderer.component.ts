import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface ActionsCellRendererParams extends ICellRendererParams {
  componentParent: any;
}

@Component({
  selector: 'app-actions-cell-renderer',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-full">
      <button (click)="onDeleteClick($event)" class="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `,
})
export class ActionsCellRendererComponent implements ICellRendererAngularComp {
  private params!: ActionsCellRendererParams;
  
  agInit(params: ActionsCellRendererParams): void {
    this.params = params;
  }
  
  refresh(params: ActionsCellRendererParams): boolean {
    return false;
  }
  
  onDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.params.componentParent) {
      this.params.componentParent.deleteTransaction(this.params.data.id);
    }
  }
}