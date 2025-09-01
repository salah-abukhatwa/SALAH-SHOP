import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
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
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  menuType: 'default' | 'seller' | 'user' = 'default';
  sellerName = '';
  userName = '';
  searchResult: Product[] = [];
  cartItem = 0;

  isSidenavOpen = false;

  @ViewChild('searchInput') searchInputRef!: ElementRef;
  @ViewChild('sidenav') sidenavRef!: ElementRef;

  constructor(private router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    this.router.events.subscribe((val: any) => {
      this.updateMenuAndCart();
    });

    // Initial load
    this.updateMenuAndCart();

    // Subscribe to cart changes
    this.productService.cartData.subscribe((cart: Cart[]) => {
      this.cartItem = cart.length;
    });
  }

  private updateMenuAndCart() {
    if (typeof localStorage !== 'undefined') {
      const sellerStore = localStorage.getItem('seller');
      const userStore = localStorage.getItem('user');

      if (sellerStore && this.router.url.includes('seller')) {
        const sellerData = JSON.parse(sellerStore)[0];
        this.sellerName = sellerData?.name || '';
        this.menuType = 'seller';
      } else if (userStore) {
        const parsed = JSON.parse(userStore);
        const userData = Array.isArray(parsed) ? parsed[0] : parsed;
        this.userName = userData?.name || '';
        this.menuType = 'user';

        if (userData?.id) {
          this.productService.updateCartCountFromRemote(userData.id);
        }
      } else {
        this.menuType = 'default';
        this.productService.initializeCartFromLocalStorage();
      }
    } else {
      this.menuType = 'default';
    }
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('seller');
    }
    this.router.navigate(['/']);
    this.menuType = 'default';
  }

  userLogout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
    }
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
      if (this.searchInputRef) {
        this.searchInputRef.nativeElement.value = '';
      }
    }
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideSidenav =
      this.sidenavRef?.nativeElement.contains(target);
    const clickedHamburger = target.classList.contains('hamburger');

    if (!clickedInsideSidenav && !clickedHamburger) {
      this.isSidenavOpen = false;
    }
  }
}
