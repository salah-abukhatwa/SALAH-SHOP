import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signUp } from '../auth-data.model';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  constructor(private http: HttpClient) {}

  userSignUp(data: signUp) {
    // Example usage of imported HttpClient
    return this.http.post('http://localhost:3000/seller', data);
  }
}
