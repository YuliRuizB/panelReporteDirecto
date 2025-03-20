import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
    providedIn: 'root'
})

export class eventsService {

    constructor(private afs: AngularFirestore, private message: NzMessageService) {
    }

    addEvent(data: any) {
        const docId = this.afs.createId();
        const newEventRef = this.afs.collection('events').doc(docId);
        const batch = this.afs.firestore.batch();
        batch.set(newEventRef.ref, { 
            ...data,                         
          });
        return batch.commit();
    }

    editEvent(data: any, eventId:string) {      
        const editEventRef = this.afs.collection('events').doc(eventId);       
        editEventRef.update(data).then(() => {
        }).catch((err) => {
            this.message.error('Hubo un error: ', err);
        })
    }


    updateEventImage(userId: string, photoURL: string) {
        const vendorRef = this.afs.collection('events').doc(userId);
        vendorRef.update({ photoURL }).then(() => {
        }).catch((err) => {
            this.message.error('Hubo un error: ', err);
        })
    }

    getEventsActive(customerId: string) {
        const accounts = this.afs.collection('events', 
          ref => ref.where('customerId', '==', customerId));
        return accounts.snapshotChanges();
      }

    toogleActiveEvent(eventId: any, active: string) {
        const eventRef =  this.afs.collection('events').doc(eventId);          
        const batch = this.afs.firestore.batch();
        batch.update(eventRef.ref, { active: active});
        return batch.commit();
      
    }

}