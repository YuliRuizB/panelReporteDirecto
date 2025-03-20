import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { from, map, Observable, of, switchMap, take } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user: Observable<User | null>;

  constructor( private afAuth: AngularFireAuth,
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
      .then((result:any) => {
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
      map( (a:any) => {
        const id = a.payload.id;
        const data = a.payload.data() as any;
        return { id: id, ...data }
      })
    ).subscribe( (user:any) => { 
      if(user.role != 'admin') {
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

  signOut() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/authentication/login']);
    });
  }

}
