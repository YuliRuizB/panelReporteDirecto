import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
    providedIn: 'root'
})

export class suppliersService {
    constructor(private afs: AngularFirestore, private message: NzMessageService) {
    }

    getSupplier(customerId: string) {
        const prom = this.afs.collection('supplies', 
          ref => ref.where('customerId', '==', customerId));
        return prom.snapshotChanges();
     }

     getSupplierList(suppId :string) {
        const prom = this.afs.collection('supplies').doc(suppId).collection('supplieList');
        return prom.snapshotChanges();
     }


     addSupplier(data: any) {
        const docId = this.afs.createId();
        const newPromRef = this.afs.collection('supplies').doc(docId);
        const batch = this.afs.firestore.batch();
        batch.set(newPromRef.ref, { 
            ...data,
            uid: docId                   
          });
        return batch.commit();
    }

    editSupp(data: any, suppId: string) {
        const editRef = this.afs.collection('supplies').doc(suppId);
        editRef.update(data).then(() => {
        }).catch((err) => {
            this.message.error('Hubo un error: ', err);
        })
    }


    toogleActiveSupp(supId: any, active: string) {
        const eventRef = this.afs.collection('supplies').doc(supId);
        const batch = this.afs.firestore.batch();
        batch.update(eventRef.ref, { active: active });
        return batch.commit();

    }

    deleteSupp(supId: string) {
        const deleteEventRef = this.afs.collection('supplies').doc(supId);
        deleteEventRef.delete().then(() => {
            this.message.success('Insumo eliminado correctamente');
        }).catch((err) => {
            this.message.error('Hubo un error al eliminar: ', err);
        });
    }

}