import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { configuationsService } from '../../services/configurations.service';
import { map } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.css'
})
export class ConfigurationsComponent {
  switchValue = false;
  title: string = "";
  description: string = "";
  selectedUid: string = "";
  evidenceList: any = [];
  isModalVisible: boolean = false;
  isModalVisibleE: boolean = false;
  editEvidence: string = '';
  addEvidence: string ='';
  selectedData: any = null;
  authService = inject(AuthenticationService);
  configService = inject(configuationsService);
  user: any;

  constructor( private messageService: NzMessageService) {

    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.loadDataCustomer(this.user.customerId);
        this.loadEvidenceType(this.user.customerId);
      } else {
        this.user = [];
      }
    });

  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }
  loadEvidenceType(customerId:string) {
    this.configService.getEvidenceTypeList(customerId).pipe(
         map((actions: any) => actions.map((a: any) => {
           const id = a.payload.doc.id;
           const data = a.payload.doc.data() as any;
           return {
             id,
            ...data
           };
         }))
       ).subscribe((evidenceList: any) => {
        this.evidenceList = evidenceList;
       });
 }

  loadDataCustomer(customerId:string) {
     this.configService.getConfigurations(customerId).pipe(
          map((actions: any) => actions.map((a: any) => {
            const id = a.payload.doc.id;
            const data = a.payload.doc.data() as any;
            return {
              id,
             ...data
            };
          }))
        ).subscribe((config: any) => {
          this.title = config[0].birthdayTitle;
          this.description =config[0].birthdayDescription;
          this.switchValue =config[0].isBirthdayConfig;
        });
  }


  selectInfo() {

  }

  openNewModal(data: any) {
    this.isModalVisible = true;
    this.isModalVisibleE = false;
  }

  openEditModal() {

    if (this.selectedUid.length <= 0){      
      this.sendMessage("error", "Favor de seleccionar un tipo de Evidencia a Editar ");
      this.isModalVisibleE = false;
      return
    }

    const selectedEvidence = this.evidenceList.find((e:any) => e.uid === this.selectedUid);
  
    if (selectedEvidence) {
      this.editEvidence = selectedEvidence.name;
    } else {
      this.sendMessage("error", "No se encontró la evidencia seleccionada.");
      return;
    }    
    this.isModalVisible = false;
    this.isModalVisibleE = true;
  }

  handleAddCancel() {
    this.isModalVisible = false;
    this.isModalVisibleE = false;
    this.editEvidence = '';
    this.addEvidence = "";
  }

  saveRecord() {    
    const evidenceType = {
      active :true,
      customerId: this.user.customerId,
      name:this.addEvidence
    }
    this.configService.addEvidenceType(evidenceType).then(() => {
      this.sendMessage("success", "Agrego el tipo de Evidencia con éxito");
      this.isModalVisible = false;
      this.addEvidence = '';
    }).catch((error) => {
      this.sendMessage("error", "Ocurrió un error al agregar la evidencia: " + error);
    });
  }

  saveRecordE() {

    const selectedEvidence = this.evidenceList.find((e:any) => e.uid === this.selectedUid);
  
    if (selectedEvidence && this.editEvidence !== '') {
      this.configService.updateEvidenceType(this.selectedUid, this.editEvidence).then(() => {
        this.sendMessage("success", "Se actualizó con éxito el Tipo de Evidencia.");
        this.isModalVisibleE = false;
      }).catch((error) => {
        this.sendMessage("error", "Ocurrió un error al actualizar: " + error);
      });
    } else {
      this.sendMessage("error", "Validar la información");
      return;
    }
  }
  deleteResponse() {
    if (this.selectedUid) {
      this.configService.updateStatusEvidenceType(this.selectedUid).then(() => {
         this.sendMessage("error",'Se borro el registro con éxito');
        this.isModalVisibleE = false;       
      });
    }
  }

  saveData() {
    if (!this.switchValue || !this.title?.trim() || !this.description?.trim()) {
      this.sendMessage("error", "Titulo y descripción son obligatorios en caso de activar felicitaciones atomaticas");
      return;
    }

    this.configService.updateConfiguration(this.user.customerId, this.switchValue,
      this.title,  this.description).then(() => {
        this.sendMessage("success", "Se actualizó con éxito la configuración del cliente.");
      }).catch((error) => {
        this.sendMessage("error", "Ocurrió un error al actualizar: " + error);
      });
      
  }
}
