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
import { Cart, Product } from '../model/product.model';
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
  cartItem = 0;
  @ViewChild('searchInput') searchInputRef!: ElementRef;
  constructor(private router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    this.router.events.subscribe((val: any) => {
      if (val.url) {
        if (localStorage.getItem('seller') && val.url.includes('seller')) {
          let sellerStore = localStorage.getItem('seller');
          let sellerData = sellerStore && JSON.parse(sellerStore)[0];
          this.sellerName = sellerData ? sellerData.name : '';
          this.menuType = 'seller';
        } else if (localStorage.getItem('user')) {
          let userStore = localStorage.getItem('user');
          if (userStore) {
            const parsed = JSON.parse(userStore);
            let userData = Array.isArray(parsed) ? parsed[0] : parsed;
            this.userName = userData?.name || '';
          }
          this.menuType = 'user';

          //  Load cart from remote for logged-in user
          const userId = JSON.parse(localStorage.getItem('user') || '[]').id;
          if (userId) {
            this.productService.updateCartCountFromRemote(userId);
          }
        } else {
          this.menuType = 'default';
          //  Only initialize from local if not logged in
          this.productService.initializeCartFromLocalStorage();
        }

        //  Subscribe once to keep cart badge updated
        this.productService.cartData.subscribe((cart: Cart[]) => {
          this.cartItem = cart.length;
        });
      }
    });

    // Initial load (in case no router event yet)

    if (!localStorage.getItem('user')) {
      this.productService.initializeCartFromLocalStorage();
    } else {
      const userId = JSON.parse(localStorage.getItem('user') || '[]').id;
      if (userId) {
        this.productService.updateCartCountFromRemote(userId);
      }
    }
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
        .pipe(debounceTime(300), distinctUntilChanged())
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
