import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
    providedIn: 'root'
})

export class promotionService {
    constructor(private afs: AngularFirestore, private message: NzMessageService) {
    }

    addPromotion(data: any) {
        const docId = this.afs.createId();
        const newPromRef = this.afs.collection('promotions').doc(docId);
        const batch = this.afs.firestore.batch();
        batch.set(newPromRef.ref, { 
            ...data,
            uid: docId                   
          });
        return batch.commit();
    }

    editPromotion(data: any, promotionId:string) {      
        const editPromRef = this.afs.collection('promotions').doc(promotionId);       
        editPromRef.update(data).then(() => {
        }).catch((err) => {
            this.message.error('Hubo un error: ', err);
        })
    }

    updateEventImage(promId: string, photoURL: string) {
        const promRef = this.afs.collection('promotions').doc(promId);
        promRef.update({ photoURL }).then(() => {
        }).catch((err) => {
            this.message.error('Hubo un error: ', err);
        })
    }

    getPromotions(customerId: string) {
        const prom = this.afs.collection('promotions', 
          ref => ref.where('customerId', '==', customerId));
        return prom.snapshotChanges();
      }

    toogleActiveProm(promId: any, active: string) {
        const promRef =  this.afs.collection('promotions').doc(promId);          
        const batch = this.afs.firestore.batch();
        batch.update(promRef.ref, { active: active});
        return batch.commit();
      
    }
    deleteProm(promId: string) {
        const deletePromRef = this.afs.collection('promotions').doc(promId);
        deletePromRef.delete().then(() => {
            this.message.success('Promoción eliminada correctamente');
        }).catch((err) => {
            this.message.error('Hubo un error al eliminar: ', err);
        });
    }


}
