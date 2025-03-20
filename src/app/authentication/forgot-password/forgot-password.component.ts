import { Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  loginForm!: FormGroup;
  
 constructor(
    private authService: AuthenticationService,
    private fb: UntypedFormBuilder   
    ) {
  }
  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.loginForm.controls) {
      this.loginForm.controls[i].markAsDirty();
      this.loginForm.controls[i].updateValueAndValidity();
    }

    if (this.loginForm.valid) {
      this.authService.forgotPassword(this.loginForm.get('userName')!.value);
    }
  }

 

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: [null, [Validators.required]]
    });
  }

}
