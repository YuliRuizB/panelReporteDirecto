import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
    providedIn: 'root'
})

export class configuationsService {
    constructor(private afs: AngularFirestore, private message: NzMessageService) {

    }

    getConfigurations(customerId: string) {
        const prom = this.afs.collection('customers',
            ref => ref.where('uid', '==', customerId));
        return prom.snapshotChanges();
    }


    updateConfiguration(id: string, isBirthdayConfig: boolean, title: string
        , description: string) {

        const driver = this.afs.collection('customers').doc(id);
        return driver.update({
            isBirthdayConfig: isBirthdayConfig,
            birthdayTitle: title,
            birthdayDescription: description
        });
    }


    getEvidenceTypeList(customerId: string) {
        const accounts = this.afs.collection('evidenceType',
            ref => ref.where('customerId', '==', customerId)
                .where('active', '==', true));
        return accounts.snapshotChanges();
    }

    updateEvidenceType(id: string,  name: string) {
        const driver = this.afs.collection('evidenceType').doc(id);
        return driver.update({
            name: name        
        });
    }

    addEvidenceType(data: any) {
        const docId = this.afs.createId();
        const newEvidenceTypeRef = this.afs.collection('evidenceType').doc(docId);
        const batch = this.afs.firestore.batch();        
        batch.set(newEvidenceTypeRef.ref, {
            ...data,
            uid: docId
        });
    
        return batch.commit();
    }

    updateStatusEvidenceType(id: string) {
        const driver = this.afs.collection('evidenceType').doc(id);
        return driver.update({ active: false});
      }
    

}