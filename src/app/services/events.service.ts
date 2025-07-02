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
            uid: docId
        });
    
        return batch.commit();
    }

    editEvent(data: any, eventId: string) {
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

    getEventsAtt(customerId: string, eventId:string) {
        const accounts = this.afs.collection('eventRegistration',
            ref => ref.where('customerId', '==', customerId)
                    .where('eventId', '==', eventId));
        return accounts.snapshotChanges();
    }


    getEventClick(customerId: string) {
        const accounts = this.afs.collection('eventsClick',
            ref => ref.where('customerId', '==', customerId));
        return accounts.snapshotChanges();
    }

    toogleActiveEvent(eventId: any, active: string) {
        const eventRef = this.afs.collection('events').doc(eventId);
        const batch = this.afs.firestore.batch();
        batch.update(eventRef.ref, { active: active });
        return batch.commit();

    }

    deleteEvent(eventId: string) {
        const deleteEventRef = this.afs.collection('events').doc(eventId);
      
        // Primero eliminamos el evento
        deleteEventRef.delete().then(() => {
          // Luego buscamos todos los clicks relacionados a ese evento
          this.afs.collection('eventsClick', ref => ref.where('eventUid', '==', eventId))
            .get()
            .subscribe(snapshot => {
              const batch = this.afs.firestore.batch();
      
              snapshot.forEach(doc => {
                batch.delete(doc.ref);
              });
      
              // Ejecutamos el batch
              batch.commit().then(() => {
                this.message.success('Evento y registros relacionados eliminados correctamente');
              }).catch(error => {
                this.message.error('Error al eliminar los registros relacionados: ' + error.message);
              });
            });
      
        }).catch((err) => {
          this.message.error('Hubo un error al eliminar el evento: ' + err.message);
        });
      }
      

}