import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
    providedIn: 'root'
})

export class welcomeService {
    constructor(private afs: AngularFirestore, private message: NzMessageService) {
    }


    getUsers(customerId: string) {
        const prom = this.afs.collection('users', 
          ref => ref.where('customerId', '==', customerId));
        return prom.snapshotChanges();
     }

     getEvents(customerId: string) {
        const prom = this.afs.collection('events', 
          ref => ref.where('customerId', '==', customerId)
          .where('active', '==', true));
        return prom.snapshotChanges();
     }

     getProm(customerId: string) {
        const prom = this.afs.collection('promotions', 
            ref => ref.where('customerId', '==', customerId)
            .where('active', '==', true));
        return prom.snapshotChanges();
     }

}
