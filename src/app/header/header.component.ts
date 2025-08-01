import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  Pipe,
  ViewChild,
  viewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../model/product.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  menuType: string = 'default';
  sellerName: string = '';
  userName: string = '';
  searchResult: Product[] = [];
  @ViewChild('searchInput') searchInputRef!: ElementRef;
  constructor(private router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    this.router.events.subscribe((val: any) => {
      if (val.url) {
        if (localStorage.getItem('seller') && val.url.includes('seller')) {
          let sellerStore = localStorage.getItem('seller');
          let sellerData = sellerStore && JSON.parse(sellerStore)[0];
          this.sellerName = sellerData ? sellerData.name : '';
          console.log(this.sellerName);
          this.menuType = 'seller';
        } else if (localStorage.getItem('user')) {
          let userStore = localStorage.getItem('user');
          let userData = userStore && JSON.parse(userStore);
          this.userName = userData ? userData.name : '';
          console.log(this.userName);
          this.menuType = 'user';
        } else {
          this.menuType = 'default';
        }
      }
    });
  }

  logout() {
    localStorage.removeItem('seller');
    this.router.navigate(['/']);
    this.menuType = 'default';
  }
  userLogout() {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
    this.menuType = 'default';
  }
  searchProducts(event: KeyboardEvent): void {
    const element = event.target as HTMLInputElement;
    const query = element.value;
    if (query.length > 2) {
      this.productService
        .searchProducts(query)
        .pipe(
          debounceTime(300), // Wait 300ms after last keystroke
          distinctUntilChanged() // Only if query changed
        )
        .subscribe((result) => {
          this.searchResult = result;
        });
    } else {
      this.searchResult = [];
    }
  }

  submitSearch(searchValue: string): void {
    if (searchValue) {
      this.router.navigate([`search/${searchValue}`]);
      this.searchResult = [];
      this.searchInputRef.nativeElement.value = '';
    }
  }
  // hideSearchResults(): void {
  //   this.searchResult = [];
  //   if (this.searchInputRef) {
  //     this.searchInputRef.nativeElement.value = '';
  //   }
  // }
}
