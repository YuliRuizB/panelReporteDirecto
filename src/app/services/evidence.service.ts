import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";
import { firstValueFrom } from 'rxjs';
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

  getEvidenceType(customerId: string) {
    const accounts = this.afs.collection('evidenceType',
      ref => ref.where('customerId', '==', customerId));
    return accounts.snapshotChanges();
  }

  getNotifyEvidence(evidenceId: string) {
    const accounts = this.afs.collection('notify',
      ref => ref.where('evidenceId', '==', evidenceId));
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
      uid:docId
    });
    return batch.commit();
  }

  addResponseList(data: any) {
    const docId = this.afs.createId();
    const newEventRef = this.afs.collection('responseList').doc(docId);
    const batch = this.afs.firestore.batch();
    batch.set(newEventRef.ref, {
      ...data,
      uid:docId
    });
    return batch.commit();
  }


  updateStatusEvidence(id: string, state: string) {
    const driver = this.afs.collection('evidence').doc(id);
    return driver.update({ status: state});
  }

  
  updateStatusEvidenceUser(idUser:string, id: string, state: string) {
    const driver = this.afs.collection('users').doc(idUser).collection('evidence').doc(id);
    return driver.update({ status: state});
  }

  async findEvidenceDocId(userId: string, idDocEvidenceSample: string): Promise<string> {
    const evidenceRef = this.afs.collection('users')
      .doc(userId)
      .collection('evidence', ref => ref.where('idDocEvidenceSample', '==', idDocEvidenceSample));
  
    const snapshot = await firstValueFrom(evidenceRef.get());
  
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    } else {
      throw new Error('No evidence found for the given ID');
    }
  }
 
  
  
  updateResponse(id: string, data: any): Promise<void> {
    const vendorRef = this.afs.collection('responseList').doc(id);
    return vendorRef.update(data)
      .then(() => {
        this.message.success('Información actualizada correctamente');
      })
      .catch((err) => {
        this.message.error('Hubo un error al actualizar el usuario: ' + err.message);
        throw err;
      });
  }
  updateStatusResponseList(id: string) {
    const driver = this.afs.collection('responseList').doc(id);
    return driver.update({ status: false});
  }


  getResponseList(customerId: string, status:string) {
    const accounts = this.afs.collection('responseList',
        ref => ref.where('customerId', '==', customerId)
        .where('active', '==', true)
        .where('status', '==', status));
    return accounts.snapshotChanges();
}


}