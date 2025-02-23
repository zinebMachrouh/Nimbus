import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "../../../modules/auth/services/auth.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private authService : AuthService, private router : Router) {}

  login(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/library']);
    }else {
      this.router.navigate(['/login']);
    }
  }
}
