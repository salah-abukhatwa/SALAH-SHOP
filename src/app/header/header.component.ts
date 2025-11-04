import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../model/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  menuType: 'default' | 'seller' | 'user' = 'default';
  userName = '';
  sellerName = '';
  cartItem = 0;
  searchResult: Product[] = [];
  isBrowser = false;
  isSidenavOpen = false;

  @ViewChild('searchInputRef') searchInputRef!: ElementRef;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.cartService.cartData.subscribe(
      (cart) => (this.cartItem = cart.length)
    );

    this.router.events.subscribe(() => {
      this.updateHeaderData();
      this.searchResult = [];
    });

    this.updateHeaderData();
  }

  updateHeaderData() {
    if (!this.isBrowser) return;

    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const sellerData = JSON.parse(localStorage.getItem('seller') || 'null');

    if (sellerData?.id) {
      this.menuType = 'seller';
      this.sellerName = sellerData.name;
    } else if (userData?.id) {
      this.menuType = 'user';
      this.userName = userData.name;
      this.cartService.updateCart(userData.id);
    } else {
      this.menuType = 'default';
      this.cartService.loadLocalCart();
    }
  }

  userLogout() {
    localStorage.removeItem('user');
    this.menuType = 'default';
    this.cartService.loadLocalCart();
    this.router.navigate(['/']);
  }

  logout() {
    localStorage.removeItem('seller');
    this.menuType = 'default';
    this.router.navigate(['/']);
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  searchProducts(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      this.productService.searchProducts(query).subscribe((res) => {
        this.searchResult = res;
      });
    } else this.searchResult = [];
  }

  clearSearch() {
    this.searchResult = [];
    if (this.searchInputRef) this.searchInputRef.nativeElement.value = '';
  }

  submitSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate([`/search/${query.trim()}`]);
      this.clearSearch();
    }
  }
}
