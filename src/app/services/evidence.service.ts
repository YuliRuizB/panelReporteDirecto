import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
  providedIn: 'root'
})

export class evidenceService {

  constructor(private afs: AngularFirestore, private message: NzMessageService) {
  }

  getEvidence(customerId: string) {
    const accounts = this.afs.collection('evidence',
      ref => ref.where('customerId', '==', customerId));
    return accounts.snapshotChanges();
  }

  updateEvidence(id: string, data: any): Promise<void> {
    const vendorRef = this.afs.collection('evidence').doc(id);
    return vendorRef.update(data)
      .then(() => {
        this.message.success('Información actualizada correctamente');
      })
      .catch((err) => {
        this.message.error('Hubo un error al actualizar el usuario: ' + err.message);
        throw err;
      });
  }

  addNotify(data: any) {
    const docId = this.afs.createId();
    const newEventRef = this.afs.collection('notify').doc(docId);
    const batch = this.afs.firestore.batch();
    batch.set(newEventRef.ref, {
      ...data,
    });
    return batch.commit();
  }

  updateStatusEvidence(id: string, state: string) {
    const driver = this.afs.collection('evidence').doc(id);
    return driver.update({ status: state});
  }


}