import { Component, inject, OnInit } from '@angular/core';
import { welcomeService } from '../../services/welcome.service';
import { map } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { evidenceService } from '../../services/evidence.service';
import { Evidence } from '../../interface/evidence.type';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  welcomeService = inject(welcomeService);
  totUsers: string = "0";
  totEvents: string = "0";
  totPub: string = "0";
  totEvidence: number = 0;
  totEvidencePending: number = 0;;
  totEvidenceRevision: number = 0;
  totEvidenceApproved: number = 0;
  totEvidenceRejected: number = 0;
  totEvidenceFinalized: number = 0;
  authService = inject(AuthenticationService);
  evidenceService = inject(evidenceService);
  user: any;
  listOfData: Evidence[] = [];

  constructor() {
    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.totalUsers(this.user.customerId);
        this.totalEvents(this.user.customerId);
        this.totalProm(this.user.customerId);
        this.loadEvidences(this.user.customerId);
      } else {
        this.user = [];
      }
    });
  }

   loadEvidences(customerId: string) {
      this.evidenceService.getEvidence(customerId).pipe(
        map((actions: any) => actions.map((a: any) => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          return {
            id,
            ...data
          };
        }))
      ).subscribe((evidenceList: Evidence[]) => {
        this.listOfData = evidenceList;
        this.updatePendingCount();
      });
    }

    updatePendingCount(): void {
      this.totEvidencePending = this.listOfData.filter(item => item.status === 'PENDING').length;
      this.totEvidence = this.listOfData.length;
      this.totEvidenceRevision = this.listOfData.filter(item => item.status === 'REVIEW').length;
      this.totEvidenceApproved = this.listOfData.filter(item => item.status === 'APPROVED').length;
      this.totEvidenceRejected = this.listOfData.filter(item => item.status === 'REJECT').length;
      this.totEvidenceFinalized = this.listOfData.filter(item => item.status === 'FINALIZED').length;
    }

  ngOnInit() { }

  totalUsers(customerId: string) {
    this.welcomeService.getUsers(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data };
      }))
    ).subscribe((tot: any) => {
      this.totUsers = tot.length;
    });
  }

  totalEvents(customerId: string) {
    this.welcomeService.getEvents(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data };
      }))
    ).subscribe((tot: any) => {
      this.totEvents = tot.length;
    });
  }

  totalProm(customerId: string) {
    this.welcomeService.getProm(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data };
      }))
    ).subscribe((tot: any) => {
      this.totPub = tot.length;
    });
  }

}
