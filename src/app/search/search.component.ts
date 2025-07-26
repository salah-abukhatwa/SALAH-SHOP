import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  searchResult: any[] = [];

  constructor(
    private productService: ProductService,
    private router: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const query = this.router.snapshot.paramMap.get('query');
    console.log('Search Query:', query);
    if (query) {
      this.productService.searchProducts(query).subscribe((result) => {
        this.searchResult = result;
      });
    }
  }
}
