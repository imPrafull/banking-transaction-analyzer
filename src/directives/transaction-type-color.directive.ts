import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appTransactionTypeColor]',
  standalone: true,
})
export class TransactionTypeColorDirective implements OnChanges {
  @Input('appTransactionTypeColor') transactionType: 'Credit' | 'Debit' = 'Credit';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactionType']) {
      this.updateColor();
    }
  }

  private updateColor(): void {
    if (this.transactionType === 'Credit') {
      this.renderer.setStyle(this.el.nativeElement, 'color', 'rgb(34 197 94)'); // text-green-500
      this.renderer.setStyle(this.el.nativeElement, 'font-weight', '600');
    } else if (this.transactionType === 'Debit') {
      this.renderer.setStyle(this.el.nativeElement, 'color', 'rgb(239 68 68)'); // text-red-500
      this.renderer.setStyle(this.el.nativeElement, 'font-weight', '600');
    }
  }
}