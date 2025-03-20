import { Component, inject } from '@angular/core';
import { evidenceService } from '../../services/evidence.service';
import { AuthenticationService } from '../../services/authentication.service';
import { map } from 'rxjs';
import { Evidence } from '../../interface/evidence.type';
import { myProfileService } from '../../services/myprofile.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { notify } from '../../interface/notify.type';
import { NotificationService } from '../../services/notifications.service';

@Component({
  selector: 'app-evidence',
  templateUrl: './evidence.component.html',
  styleUrl: './evidence.component.css'
})

export class EvidenceComponent {
  evidenceService = inject(evidenceService);
  authService = inject(AuthenticationService);
  myprofileService = inject(myProfileService);
  user: any;
  totEvidence: number = 0;
  totEvidencePending: number = 0;
  totEvidenceReview: number = 0;
  totEvidenceApproved: number = 0;
  totEvidenceReject: number = 0;
  totEvidenceFinalize: number = 0;
  listOfData: Evidence[] = [];
  filteredData: Evidence[] = [];
  selectedStatus: string = '';
  title: string = '';
  description: string = '';
  statusList = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'REVIEW', label: 'En Revisión' },
    { value: 'REJECT', label: 'Rechazado' },
    { value: 'APPROVED', label: 'Aprobado' },
    { value: 'FINALIZED', label: 'Finalizado' }
  ];
  isVisible = false;
  selectedData: any = null;

  constructor(private message: NzMessageService, private notificationService: NotificationService) {

    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
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
      this.filteredData = [...this.listOfData];
      this.updatePendingCount();
    });
  }

  filterTot(): void {
    this.filteredData = this.listOfData;
  }

  filterPending(): void {
    this.filteredData = this.listOfData.filter(item => item.status === 'PENDING');
  }

  filterReview(): void {
    this.filteredData = this.listOfData.filter(item => item.status === 'REVIEW');
  }

  filterApproved(): void {
    this.filteredData = this.listOfData.filter(item => item.status === 'APPROVED');
  }

  filterReject(): void {
    this.filteredData = this.listOfData.filter(item => item.status === 'REJECT');
  }

  filterFinalized(): void {
    this.filteredData = this.listOfData.filter(item => item.status === 'FINALIZED');
  }

  updatePendingCount(): void {
    this.totEvidencePending = this.listOfData.filter(item => item.status === 'PENDING').length;
    this.totEvidence = this.listOfData.length;
    this.totEvidenceReview = this.listOfData.filter(item => item.status === 'REVIEW').length;
    this.totEvidenceApproved = this.listOfData.filter(item => item.status === 'APPROVED').length;
    this.totEvidenceReject = this.listOfData.filter(item => item.status === 'REJECT').length;
    this.totEvidenceFinalize = this.listOfData.filter(item => item.status === 'FINALIZED').length;
  }

  openModal(data: any): void {
    this.selectedData = data;
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.selectedData = null;
  }

  changeStatus(): void {
    if (this.selectedData) {

      if (!this.selectedStatus || !this.title.trim() || !this.description.trim()) {
        this.message.error('Reporte directo informa. ' + 'Faltan datos por llenar, favor de validar.');
        return;
      }
      // add notify
      const noty: notify = {
        active: true,
        date: new Date(), // Asigna la fecha actual
        name: `${this.selectedData.name} ${this.selectedData.lastName} ${this.selectedData.secondLastName}`,
        email: this.selectedData.email,
        title: this.title,
        description: this.description,
        customerId: this.user.customerId,
        uidUser: this.selectedData.uid
      };

      this.evidenceService.addNotify(noty);
      this.evidenceService.updateStatusEvidence(this.selectedData.id, this.selectedStatus);

      this.myprofileService.getUserData(this.selectedData.uid).subscribe((user: any) => {
        if (user) {
          if (user.token) {
            this.enviarNotificacion(user.token,this.title, this.description);
          } 
        }
      });
      this.isVisible = false;
    }
  }

  enviarNotificacion(token:string, title:string, description: string) {
    //this.notificationService.sendPushNotification(title, description, token);

    this.notificationService.sendPushNotification(title, description, token).subscribe({
      next: async (response: any) => {  
      },
      error: (e: any) => {
        console.error(e);
      },
    }); 
  }

  updateDefaultMessage() {
    if (this.selectedStatus === 'REVIEW') {
      this.description = 'Gracias por tu evidencia, el equipo comenzará a trabajar en el caso';
      this.title = "El caso a cambiado a status en Revision"
    } else if (this.selectedStatus === 'APPROVED') {
      this.description = 'Se aprobó el caso, se comenzará a trabajar en él.';
      this.title = "El caso a cambiado a status Aprobado"
    } else if (this.selectedStatus === 'FINALIZED') {
      this.description = 'El caso se ha resuelto, gracias por creer en nosotros, seguiremos trabajando para ti.';
      this.title = "El caso a cambiado a status Finalizado";
    } else if (this.selectedStatus === 'PENDING') {
      this.description = '';
      this.title = "El caso a cambiado a status Pendiente";
    } else if (this.selectedStatus === 'REJECT') {
      this.description = '';
      this.title = "El caso a cambiado a status Rechazado";
    }
  }
}
