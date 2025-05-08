import { Component } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TermsComponent } from '../../pages/terms/terms.component';
import { AuthenticationService } from '../../services/authentication.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
  signUpForm!: UntypedFormGroup;
  customersType$: Observable<any[]> | undefined;
  customersCountry$: Observable<any[]> | undefined;
  custConsecutive$: Observable<any[]> | undefined;
  isLoadingOne = false;
  cCollection: AngularFirestoreCollection<any>;
  countryCollection: AngularFirestoreCollection<any>;
  consecutiveCollection: AngularFirestoreCollection<any>;
  initialConsecutive : string = '';
  initialConsecutiveUID: string = '';
  valueCountry : string = '';
  valueType : string = '';

constructor( private modalService: NzModalService,
  private fb: UntypedFormBuilder,
  private afs: AngularFirestore,
  public authService: AuthenticationService,
  private notification: NzNotificationService
){
  this.signUpForm = this.fb.group({
    email: [null, [Validators.email, Validators.required]],
    password: [null, [Validators.required, Validators.minLength(8), Validators.pattern('^[A-Za-z0-9 ]+$')]],
    checkPassword: [null, [Validators.required]],
    customerName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    customerCountry: [''],
    firstName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    lastName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
    address:  [null, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],  
    phoneNumber:  ['', [Validators.required]],
    customertype: [''],   
    consecutiveField: [{ value:'', disabled: true }],
    consecutive: [''],
    active:[true],
    terms: [false, [Validators.requiredTrue]],
    token: [''],
    status: ['active'],
    photoURL: [''],
  });

  this.cCollection = this.afs.collection<any>
  ('customerType', ref => ref.where('active', '==', true).orderBy('name'));
  this.countryCollection = this.afs.collection<any>
  ('customerCountry', ref => ref.where('active', '==', true).orderBy('name'));

  this.consecutiveCollection = this.afs.collection<any>('custConsecutive');
}

ngOnInit() {
  this.customersType$ = this.cCollection.snapshotChanges().pipe(
    map((actions: any[]) => actions.map(a => {
      const id = a.payload.doc.id;
      const data = a.payload.doc.data() as any;
      return { id, ...data };
    }))
  );

  this.customersCountry$ = this.countryCollection.snapshotChanges().pipe(
    map((actions: any[]) => actions.map(a => {
      const id = a.payload.doc.id;
      const data = a.payload.doc.data() as any;
      return { id, ...data };
    }))
  );

  this.custConsecutive$ = this.consecutiveCollection.snapshotChanges().pipe(
    map((actions: any[]) => {
      const items = actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data };
      });     
      
      if (items.length > 0) {
        const item = items[0];
         this.initialConsecutiveUID = items[0].uid;
        const lastIdStr = items[0].id;
        const nextIdNum = parseInt(lastIdStr, 10) + 1;
        const nextIdStr = nextIdNum.toString().padStart(3, '0');         
        this.signUpForm.get('consecutiveField')?.setValue(nextIdStr);
        this.initialConsecutive = nextIdStr;        
      }

      return items;
    })
  );

  this.custConsecutive$.subscribe();
}

  showModalTerms() {
    this.modalService.create({
      nzTitle: 'Términos y Condiciones de Uso',
      nzContent: TermsComponent,
       nzWidth: '70%'
    });
  }

  onSelectValueType(event: any) {    
    this.valueType  = event;      
   
    this.signUpForm.get('consecutiveField')?.setValue(this.valueType + this.valueCountry + this.initialConsecutive);
  }

  onSelectValueCountry(event: any) {
    this.valueCountry  = event;  
  
    this.signUpForm.get('consecutiveField')?.setValue(this.valueType + this.valueCountry + this.initialConsecutive );
  }

  submitForm(): void {
 
    for (const i in this.signUpForm.controls) {
      this.signUpForm.controls[i].markAsDirty();
      this.signUpForm.controls[i].updateValueAndValidity();
    }
    if (this.signUpForm.valid) {    
        this.signUpForm.get('customerCountry')?.setValue(this.valueCountry);
        this.signUpForm.get('customertype')?.setValue(this.valueType);
        this.signUpForm.get('consecutive')?.setValue(this.valueType + this.valueCountry + this.initialConsecutive );

      this.isLoadingOne = true;     
       this.authService.signUp(this.signUpForm.value, this.initialConsecutiveUID,  this.initialConsecutive).then(
        (result) => {
          this.isLoadingOne = false;
        }).catch((error) => {
          this.notification.create('error', 'Submit form error', error);
        }); 
    }
  }

}
