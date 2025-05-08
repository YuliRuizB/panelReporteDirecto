import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { from, map, Observable, of, switchMap, take } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private ngZone: NgZone,
    private notification: NzNotificationService
  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap((user: any) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
            .pipe(map((userData: any) => userData || null)); // Asegurar que devuelve null si no hay datos
        } else {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user');
          }
          return of(null);
        }
      })
    );
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  signIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result: any) => {
        this.ngZone.run(() => {
          this.getAccessLevel(result.user.uid);
        });
      }).catch((error) => {
        this.notification.create('error', 'Error..', error.message);
      });
  }

  async getAccessLevel(userId: string) {   

    const userRef$ = await this.afs.collection('users').doc(userId);
    userRef$.snapshotChanges().pipe(
      take(1),
      map((a: any) => {
        const id = a.payload.id;
        const data = a.payload.data() as any;

        return { id: id, ...data }
      })
    ).subscribe((user1: any) => {   
      if (user1.role != 'admin') {
        this.notification.create(
          'warning',
          'Reporte Directo Informa!, su cuenta no tiene acceso a este sistema',
          'Si esto es un error, por favor contacte al administrador del sitio.'
        );
        this.signOut();
      } else {
        this.router.navigate(['welcome']);
      }
    })
  }

  forgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        // tslint:disable-next-line: max-line-length
        this.notification.create('info', 'Reporte Direct Informa!', 'Se ha enviado un correo electrónico a su cuenta con la información necesaria para recuperar su contraseña.');
      }).catch((error) => {
        this.notification.create('error', 'Se detectaron problemas, favor de validar', error);
      });
  }

  signUp(form: any, initialConsecutiveUID: string, initialConsecutive: string) {
    const email = form.email;
    const password = form.password;
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
     
        
        this.setClientData(result.user, form, initialConsecutiveUID, initialConsecutive);
      }).catch((error) => {
        this.notification.create('error', 'Error de creación de Usuario', error);
      });
  }


  setClientData(user: any, form?: any, initialConsecutiveUID?: string, initialConsecutive?: string) {   
    const docId = this.afs.createId();
    const userDataCustomer = {     
      email: user.email,
      phoneNumber: form && form.phoneNumber ? form.phoneNumber : null,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      firstName: form.firstName,
      lastName: form.lastName,
      customerName: form.customerName,
      customerCountry: form.customerCountry,
      address: form.address,
      customertype: form.customertype,
      consecutive: form.consecutive,
      token: form.token,
      terms: form.terms,
      isBirthdayConfig: false,
      birthdayTitle: '',
      birthdayDescription: '',
      status: form && form.status !== undefined ? form.status : 'active'
    };   
    
    const newEvidenceTypeRef = this.afs.collection('customers').doc(docId);
    const batch = this.afs.firestore.batch();
    batch.set(newEvidenceTypeRef.ref, {
      ...userDataCustomer,
      uid: docId
    });
    batch.commit().then(() => {

      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
      const userData = {
        uid: user.uid,
        email: user.email,
        phoneNumber: form && form.phoneNumber ? form.phoneNumber : null,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        name: form.firstName,
        lastName: form.lastName,
        secondLastName: '',
        customerName: form.customerName,
        address: form.address,
        role: 'admin',
        colony: '',
        country: '',
        postalCode: '',
        customerId: docId,
        token: form.token,
        terms: form.terms,
        birthday: ''
      };
      
      return userRef.set(userData, {
        merge: true
      }).then((resultAdd) => {
        const driver = this.afs.collection('custConsecutive').doc(initialConsecutiveUID);
        driver.update({ id: initialConsecutive });

        this.sendVerificationMail();
        this.router.navigate(['/authentication/login']);

      })
        .catch(err => this.notification.create('error', 'Error..', err));
    }).catch(error => {
      console.error('Error creating user document:', error);
    });

  }

  async sendVerificationMail() {
    try {
      const user = await this.afAuth.currentUser;

      if (user) {
        await user.sendEmailVerification();
        this.notification.create('info', 'Gracias por registrarte!', 'Te enviamos un correo para la confirmación del registro.');
      } else {
        this.notification.create('error', 'Error de verificación de correo', 'No hay Cliente registrado');
      }
    } catch (error: any) {
      this.notification.create('error', 'Error de verificación de correo', error.message);
    }
  }


  signOut() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/authentication/login']);
    });
  }

}
