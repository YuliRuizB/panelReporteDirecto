import { Component, inject, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { myProfileService } from '../../services/myprofile.service';


@Component({
  selector: 'app-baja-usuario',
  templateUrl: './baja-usuario.component.html'
})
export class BajaUsuarioComponent implements OnInit {

  formDeleteAccount!: UntypedFormGroup;
  accountsSubscription?: Subscription;
  myProfileService = inject(myProfileService);

  constructor(private messageService: NzNotificationService,
    private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.formDeleteAccount = this.fb.group({
      userName: [null, [Validators.required]]
    });
  }
  ngOnDestroy() {
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
  }

  DeleteAccount() {
    for (const i in this.formDeleteAccount?.controls) {
      this.formDeleteAccount.controls[i].markAsDirty();
      this.formDeleteAccount.controls[i].updateValueAndValidity();
    }

    if (this.formDeleteAccount?.valid) {
      this.accountsSubscription = this.myProfileService.getUserInfoByEmail(this.formDeleteAccount.controls['email'].value).subscribe((data1: any[]) => {
        data1.forEach(action => {
          const data = action.payload.doc.data();   
          this.myProfileService.deleteUser(data['idDoc']);         
          const mensaje = "Gracias " + data['name'] + data['lastName'] +  data['secondLastName'] + "  , se a dado de baja del sistema.";
          this.messageService.success('Información', mensaje);
        });
      });
    } else {
      this.messageService.error('Error', 'Escriba por favor sus datos para tener acceso');
    }
  }
}
