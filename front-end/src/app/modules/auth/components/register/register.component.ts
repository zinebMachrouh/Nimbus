import {Component, importProvidersFrom, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  private readonly router = inject(Router);

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name : ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      principal : ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      address : ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      email : ['', [Validators.required, Validators.email]],
      phone : ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      gps_location : ['',[Validators.required]]
    }, {
      validators: this.passwordsMatch
    });
  }

  get password() { return this.registerForm.get('password'); }
  get password_confirmation() { return this.registerForm.get('password_confirmation'); }


  private passwordsMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('password_confirmation')?.value
      ? null : { passwordsMismatch: true };
  }
  onRegister(): void {
    if (this.registerForm.invalid){
      alert('Please correct the errors in the form.');
      return;
    }

    const {name, principal, address, email, phone, password, gps_location} = this.registerForm.value;
    const status = 'ACTIVE';

    const formData = new FormData();
    const fields = { name, principal, address, email, phone, password, gps_location, status };

    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

    try {
      const response = this.authService.register(formData);
      if (response) {
        this.router.navigate(['/login']);
        console.log('Registration successful');
      }else {
        console.log('Registration failed');
      }
    }catch (e) {
      console.log('An error occurred during registration.');
    }

  }
}
