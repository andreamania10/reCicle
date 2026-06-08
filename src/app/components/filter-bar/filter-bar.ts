import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBarComponent {

  search: string = '';
  category: string = '';
  maxPrice: number | null = null;

  @Output() filterChange = new EventEmitter<any>();

  applyFilter() {
    this.filterChange.emit({
      search: this.search,
      category: this.category,
      maxPrice: this.maxPrice
    });
  }
}