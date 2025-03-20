import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from 'firebase/auth';
import { user } from '../../interface/user.type';

@Component({
  selector: 'app-initial-layout',
  templateUrl: './initial-layout.component.html',
  styleUrl: './initial-layout.component.css'
})
export class InitialLayoutComponent {
  authService = inject(AuthenticationService);
  isCollapsed = false;
  user: user = {
    name: '',
    lastName: '',
    secondLastName: '',
    photoURL: '',
    customerName: ''
  };
  
  constructor(){
    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
      }  });

  }
}
