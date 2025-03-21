import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from 'firebase/auth';
import { user } from '../../interface/user.type';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BajaUsuarioComponent } from '../../pages/baja-usuario/baja-usuario.component';
import { PrivacyComponent } from '../../pages/privacy/privacy.component';
import { Router } from '@angular/router';

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
  
  constructor( private modalService: NzModalService, private router: Router){
    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
      }  });

  }

  showModalBaja() {
    this.modalService.create({
      nzTitle: 'Baja de Usuario',
      nzContent: BajaUsuarioComponent, 
      nzFooter: null
    });
  }

  openPrivacy() {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/privacy']));
    window.open(url, '_blank');
  }
}
