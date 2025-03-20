import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class myProfileService {

    constructor(private afs: AngularFirestore, private message: NzMessageService) { 
    
    }

    updateUserAvatar(userId: string, photoURL: string) {    
        
        const vendorRef = this.afs.collection('users').doc(userId);
        vendorRef.update({ photoURL }).then(() => {
        }).catch((err) => {
            this.message.error('Hubo un error: ', err);
        })
    }

    updateUser(userId: string, data: any): Promise<void> {   
        const vendorRef = this.afs.collection('users').doc(userId);
        return vendorRef.update(data) 
          .then(() => {
            this.message.success('Usuario actualizado correctamente');
          })
          .catch((err) => {
            this.message.error('Hubo un error al actualizar el usuario: ' + err.message);
            throw err; 
          });
    }
    
    getUserData(userId: string): Observable<any> {
        return this.afs.collection('users').doc<any>(userId).valueChanges();
      }
    

}