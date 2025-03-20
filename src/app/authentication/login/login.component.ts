import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private fb: FormBuilder,    
    public notification: NzNotificationService
  ) { 
    this.loginForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  submitForm(): void {   
    for (const i in this.loginForm.controls) {
      this.loginForm.controls[i].markAsDirty();
      this.loginForm.controls[i].updateValueAndValidity();
    } 
   if (this.loginForm.valid) {
      this.authService.signIn( this.loginForm.get('userName')?.value, this.loginForm.get('password')?.value);
    } else {
      this.notification.create('error', '', 'Escriba por favor sus datos para tener acceso');
    }
  }
}
