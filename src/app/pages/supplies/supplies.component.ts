import { Component, inject } from '@angular/core';
import { supplieList, supplier } from '../../interface/supplier.type';
import { AuthenticationService } from '../../services/authentication.service';
import { suppliersService } from '../../services/suppliers.service';
import { map } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { eventsService } from '../../services/events.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { event } from '../../interface/event.type';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrl: './supplies.component.css'
})
export class SuppliesComponent {
  isListView: boolean = true;
  user: any;
  authService = inject(AuthenticationService);
  suppService = inject(suppliersService);
  eventsService = inject(eventsService);
  isVisible = false;
  isVisibleEdit = false;
  isControlVisible = false;
  selectedSupp: any;
  supplierList: supplier[] = [];
  supplieListDetail: supplieList[] = [];
  supplierForm!: FormGroup;
  supplierFormEdit!: FormGroup;
  eventList: event[] = [];

  constructor(private fb: FormBuilder, private messageService: NzMessageService) {

    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      cost: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0, Validators.required],
      actualAmount: [0],
      date: [new Date(), Validators.required],
      eventUid: [''],
      customerId: [''],
      active: [true]
    });
    this.supplierFormEdit = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      cost: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0, Validators.required],
      actualAmount: [0],
      date: [new Date(), Validators.required],
      eventUid: [''],
      customerId: [''],
      active: [true]
    });


    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.loadSuppliers(this.user.customerId);
        this.loadEvents(this.user.customerId);
      } else {
        this.user = [];
      }
    });
  }

  loadSuppliers(customerId: string) {
    this.suppService.getSupplier(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data,
          startDate: data.startDate && data.startDate.seconds ? new Date(data.startDate.seconds * 1000) : undefined,
          endDate: data.endDate && data.endDate.seconds ? new Date(data.endDate.seconds * 1000) : undefined
        };
      }))
    ).subscribe((supp: supplier[]) => {
      this.supplierList = supp;
    });
  }

  loadEvents(customerId: string) {
    this.eventsService.getEventsActive(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data
        };
      }))
    ).subscribe((eventList: event[]) => {
      this.eventList = eventList;
    });
  }

  getEventDescription(eventUid: string): string {
    const event = this.eventList.find(ev => ev.id === eventUid);
    return event ? event.name : '';
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
    this.supplierForm.reset();
    this.isVisibleEdit = false;
    this.supplierFormEdit.reset();
    this.isControlVisible = false;
  }

  submitForm() {
    this.supplierForm.controls['customerId'].patchValue(this.user.customerId);
    const totalAmount =  this.supplierForm.controls['totalAmount'].value;
    this.supplierForm.controls['actualAmount'].patchValue(totalAmount);
    
    if (this.supplierForm.valid) {
      this.suppService.addSupplier(this.supplierForm.value);
      this.sendMessage('sucess', 'El Insumo se a creado con éxito');
      this.isVisible = false;
      this.supplierForm.reset();
    }
  }

  submitFormEdit() {
    if (this.supplierFormEdit.valid) {
      this.suppService.editSupp(this.supplierFormEdit.value, this.supplierFormEdit.get('uid')?.value);
      this.sendMessage('sucess', 'El Insumo se a creado con éxito');
      this.isVisibleEdit = false;
      this.supplierFormEdit.reset();
    }
  }


  formatDate(value: any): Date | null {
    if (!value) return null;
    return value.toDate ? value.toDate() : value;
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }

  toggleSuppStatus(event: any): void {
    this.suppService.toogleActiveSupp(event.uid, event.active);
    this.sendMessage("sucess", "Se actualizó con éxito el  Insumo");
  }

  confirmDeleteSupp(eventId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este Insumo?')) {
      this.suppService.deleteSupp(eventId);
    }
  }

  openEditModal(suppId: string): void {
    this.supplierFormEdit = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      date: new FormControl(null),
      cost: new FormControl(null),
      totalAmount: new FormControl(null),
      actualAmount: new FormControl(null),
      eventUid: new FormControl(null),
      customerId: new FormControl(''),
      uid: new FormControl(''),
    });

    this.selectedSupp = this.supplierList.find(supp => supp.uid === suppId);
    if (this.selectedSupp) {
      this.supplierFormEdit.patchValue({
        name: this.selectedSupp.name,
        description: this.selectedSupp.description,
        date: this.selectedSupp.date,
        cost: this.selectedSupp.cost,
        totalAmount: this.selectedSupp.totalAmount,
        customerId: this.selectedSupp.customerId,
        actualAmount: this.selectedSupp.actualAmount,
        eventUid: this.selectedSupp.eventUid,
        uid: suppId
      });
      this.isVisibleEdit = true;
    }

  }

  openModalControl(suppId: string): void {
    this.suppService.getSupplierList(suppId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data
        };
      }))
    ).subscribe((supp: supplieList[]) => {
      this.supplieListDetail = supp;
      this.isControlVisible = true;
    });

  }
  downloadPDFEntregas() {
    const element = document.querySelector('#pdfContentEtregas') as HTMLElement;

    html2canvas(element, { scale: 3 }).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');

      // Cálculos para ajustar la imagen al ancho del PDF sin deformarla
      const imgProps = pdf.getImageProperties(contentDataURL);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(contentDataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('EntregasInsumos.pdf');
    }).catch((error) => {
      console.log('Error generating PDF:', error);
    });
  }


  downloadExcelEntregas() {
    // Crear una hoja de cálculo a partir de supplieListDetail
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.supplieListDetail);
    // Crear el libro de Excel
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Entregas': worksheet },
      SheetNames: ['Entregas']
    };
    // Generar el buffer del archivo Excel
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // Guardar el archivo
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, 'EntregasInsumos.xlsx');
  }
}
