import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { VerifyEmailComponent } from "./verify-email/verify-email.component";
import { SignupComponent } from "./signup/signup.component";
import { LoginComponent } from "./login/login.component";


const routes: Routes = [  
    {
      path: 'login',
      component: LoginComponent,
      data: {
        title: 'Login'
      }
    },
    {
      path: 'signup',
      component: SignupComponent,
      data: {
        title: 'Signup'
      }
    },  
    {
      path: 'verify-email',
      component: VerifyEmailComponent,
      data: {
        title: 'Verify Email'
      }
    },
   /*  {
      path: 'please-verify-email',
      component: PleaseVerifyEmailComponent,
      data: {
        title: 'Verify Email'
      }
    }, */
    {
      path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: {
        title: 'Forgot Password'
      }
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule { }
