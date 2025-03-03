import {Component, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  private readonly router = inject(Router);

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const payload = { email, password };

      this.authService.login(payload).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/library']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Login failed: ' + (error.message || 'Unknown error'));
        }
      });
    }
  }
}
