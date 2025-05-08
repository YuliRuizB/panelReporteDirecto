import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { every, finalize, map, Observable } from 'rxjs';
import { eventsService } from '../../services/events.service';
import { user } from '../../interface/user.type';
import { AuthenticationService } from '../../services/authentication.service';
import { event, eventAtt, eventclick } from '../../interface/event.type';
import { Timestamp } from 'firebase/firestore';
import * as QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import jspdf from 'jspdf';
import { HttpClient } from '@angular/common/http';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  isVisible = false;
  isVisibleEdit = false;
  isVisiblePdf = false;
  user: any;
  eventList: event[] = [];
  eventAttList : eventAtt [] = [];
  eventClick : eventclick [] = [];
  eventusers : eventclick [] = [];
  selectedEvent: any;
  isConfirmLoading = false
  isConfirmLoadingEdit = false;
  isUploading: boolean = false;
  isClickModal:boolean = false;
  eventForm: FormGroup;
  eventFormEdit: FormGroup;
  imagePreview: string | undefined = undefined;
  imagePreviewEdit: string | undefined = undefined;
  task: AngularFireUploadTask | undefined;
  uploadPercent: Observable<number> | undefined;
  uploadvalue: number = 0;
  downloadURL: Observable<string> | undefined;
  snapshot: Observable<any> | undefined;
  UploadedFileURL: Observable<string> | undefined;
  images: Observable<any[]> | undefined;
  uploading: boolean = false;
  bucketPath: string = 'events/';
  eventsService = inject(eventsService);
  authService = inject(AuthenticationService);
  modalTitleEdit: string = "";
  qrCodeURL: string | null = null;
  imageBase64: string | null = null;
  numAtt: number = 0;
  attInterested: number = 0;
  event: any = [];
  isListView = true;
  isAttendenceModal: boolean = false;
  uniqueEvents: eventclick[] = [];

  constructor(private fb: FormBuilder,
    private bucketStorage: AngularFireStorage,
    private messageService: NzMessageService,
    private http: HttpClient
  ) {
    this.eventForm = this.fb.group({
      active: [true],
      customerId: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      address: [''],
      imageURL: [''],
      lng: [''],
      lat: [''],
      uid: [''],
      imageBase: [''],
      attendanceControl :[false]
    });

    this.eventFormEdit = this.fb.group({
      active: [true],
      customerId: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      imageURL: [''],
      address: [''],
      lng: [''],
      lat: [''],
      uid: [''],
      imageBase: [''],      
      attendanceControl :[false]
    });

    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.loadEvents(this.user.customerId);
        this.loadEventClick(this.user.customerId);
      
      } else {
        this.user = [];
      }
    });
  }
  
  generateUniqueEvents() {
    const seen = new Set();
    this.uniqueEvents = this.eventClick.filter(item => {
      if (seen.has(item.eventUid)) {
        return false;
      }
      seen.add(item.eventUid);
      return true;
    });
  }

  loadEvents(customerId: string) {
    this.eventsService.getEventsActive(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data,
          date: data.date && data.date.seconds ? new Date(data.date.seconds * 1000) : undefined,
          startTime: this.convertTimestampToDate(data.startTime),
          endTime: data.endTime,
        };
      }))
    ).subscribe((eventList: event[]) => {
      this.eventList = eventList;
    });
  }

  loadEventClick(customerId:string) {    
    this.eventsService.getEventClick(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data
        };
      }))
    ).subscribe((eventClick: eventclick[]) => {
      this.eventClick = eventClick;
      this.generateUniqueEvents();
    });
  }
  showModal(): void {
    this.isVisible = true;
    this.eventForm.reset();
  }

  handleOk(): void {
  }

  convertEndTimestampToDate(timestamp: any): Date | undefined {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return undefined;
  }

  convertTimestampToDate(timestamp: any): Date | undefined {
    return new Date(timestamp.seconds * 1000);
  }

  submitForm(): void {

    if (this.eventForm.valid && !this.isUploading) {
      this.eventForm.controls['customerId'].patchValue(this.user.customerId);
      this.eventsService.addEvent(this.eventForm.value);
      this.isConfirmLoading = true;
      this.sendMessage('sucess', 'El evento se a creado con éxito');
      this.isVisible = false;
    }
  }

  submitFormEdit(): void {    
    if (this.eventFormEdit.valid && !this.isUploading) {
      this.eventFormEdit.controls['customerId'].patchValue(this.user.customerId);
      this.eventsService.editEvent(this.eventFormEdit.value, this.eventFormEdit.get('uid')?.value);
      this.isConfirmLoadingEdit = true;
      this.sendMessage('sucess', 'El evento se a actualizado con éxito');
      this.isVisibleEdit = false;
    }
  }

  onFileSelected(info: { file: NzUploadFile }, mode: string): void {
    if (info.file.originFileObj) {
      this.getBase64(info.file.originFileObj, (img: string) => {
        const fileName = info.file.name;
        const filePath = `${this.bucketPath}/${fileName}`;
        const fileRef = this.bucketStorage.ref(filePath);
        this.task = this.bucketStorage.ref(filePath).putString(img, 'data_url');
        this.uploadPercent = this.task.percentageChanges() as Observable<number>;
        this.uploadPercent.pipe(
          map((a: any) => {
            return Number((a / 100).toFixed(2));
          })
        ).subscribe((value) => {
          this.uploading = value != 0;
          this.uploadvalue = value;
        })
        this.task.snapshotChanges().pipe(
          finalize(() => {
            this.uploading = false;
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe(async (url) => {

              if (mode === 'a') {
                this.eventForm.controls['imageURL'].patchValue(url);
                this.imagePreview = url;
              } else {
                this.eventFormEdit.controls['imageURL'].patchValue(url);
                this.imagePreviewEdit = url;
              }
              this.sendMessage("sucess", "Se actualizó con éxito la imagen de perfil");
            });
          })
        ).subscribe();
      });
    }
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isVisibleEdit = false;
    this.isVisiblePdf = false;
    this.isAttendenceModal = false;
  }

  handleCancelAtt(){
    this.isAttendenceModal = false;  
  }


  handleCancelClick(){
    this.isClickModal = false;  
  }

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result !== null && typeof reader.result === 'string') {
        callback(reader.result);
      } else {
        this.sendMessage('error', 'FileReader invalido');
      }
    });
    reader.readAsDataURL(img);
  }

  openEditModal(eventId: string): void {
    this.eventFormEdit = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      date: new FormControl(null),
      startTime: new FormControl(null),
      endTime: new FormControl(null),
      lng: new FormControl(null),
      lat: new FormControl(null),
      customerId: new FormControl(''),
      uid: new FormControl(''),
      imageURL: new FormControl(''),
      imageBase: new FormControl(''),
      address: new FormControl(''),
      attendanceControl : new FormControl(null)
    });


    this.selectedEvent = this.eventList.find(event => event.uid === eventId);
    if (this.selectedEvent) {
      this.eventFormEdit.patchValue({
        name: this.selectedEvent.name,
        description: this.selectedEvent.description,
        date: this.selectedEvent.date,
        startTime: this.selectedEvent.startTime,
        endTime: this.convertTimestampToDate(this.selectedEvent.endTime),
        lng: this.selectedEvent.lng,
        lat: this.selectedEvent.lat,
        address: this.selectedEvent.address,
        customerId: this.selectedEvent.customerId,
        imageURL: this.selectedEvent.imageURL,
        imageBase: this.selectedEvent.imageBase,
        uid: eventId,
        attendanceControl: this.selectedEvent.attendanceControl
      });
      this.isVisibleEdit = true;
      this.modalTitleEdit = 'Editar Evento';
    }
  }

  openAttendanceModal(eventId: string){
    this.eventsService.getEventsAtt(this.user.customerId, eventId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data,
        };
      }))
    ).subscribe((eventListAtt: eventAtt[]) => {
      this.eventAttList = eventListAtt;
      this.numAtt =  eventListAtt.length;
      this.isAttendenceModal = true;
    });  
  }

  openClickUsers(eventUid: any) {  
  
  const filtered = this.eventClick.filter(item => item.eventUid === eventUid);
    this.eventusers = filtered.reduce((acc: eventclick[], current) => {
      const exists = acc.find((user: eventclick) => user.email === current.email);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    this.isClickModal = true;
  }

  downloadEventPdf(event: any, eventId: string): void {
    this.event = {
      name: event.name,
      description: event.description,
      date: event.date,
      startTime: this.convertTimestampToDate(event.startTime),
      endTime: this.convertTimestampToDate(event.endTime),
      lng: event.lng,
      lat: event.lat,
      customerId: event.customerId,
      imageURL: event.imageURL,
      address: event.address,
      imageBase: event.imageBase,
      uid: event.uid,
      attendanceControl: event.attendanceControl
    };
    this.generateQRCode(event);
    this.isVisiblePdf = true;
  }

  generateQRCode(event: any) {
    QRCode.toDataURL(event.uid, { errorCorrectionLevel: 'H' }, (err, url) => {
      if (!err) {
        this.qrCodeURL = url;
      }
    });
  }

  async convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(imageUrl, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result as string);
        },
        error: (error) => reject(error)
      });
    });
  }

  downloadPDF() {
    const eventA = document.querySelector('#pdfContent') as any;

    const image = html2canvas(eventA, { scale: 1, }).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/jpg', 1.0)
      let pdf = new jspdf('p', 'mm', 'a4');
      let position = 10;
      pdf.addImage(contentDataURL, 'PNG', 5, 5, 200, 250, undefined, 'FAST')
      pdf.save('Evento.pdf');
    }).catch((error) => {
      console.log(error);
    })
  }
  downloadPDFAtt() {
    const eventA = document.querySelector('#pdfContentAtt') as HTMLElement;
  
    html2canvas(eventA, { scale: 2 }).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');
  
      const imgWidth = 190; // A4 width - margins
      const pageHeight = 295; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const position = 10;
  
      pdf.addImage(contentDataURL, 'PNG', 10, position, imgWidth, imgHeight);
      pdf.save('ControlAsistencia.pdf');
    }).catch((error) => {
      console.error('Error al generar PDF:', error);
    });
  }


  toggleEventStatus(event: any): void {
    this.eventsService.toogleActiveEvent(event.uid, event.active);
    this.sendMessage("sucess", "Se actualizó con éxito el Evento");
  }

  toggleView() {
    this.isListView = !this.isListView;
  }

  confirmDeleteEvent(eventId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      this.deleteEvent(eventId);
    }
  }

  deleteEvent(eventId: string): void {    
    this.eventsService.deleteEvent(eventId);
  }

  getAttendeesCount(eventId: string): number {
    const filtered = this.eventClick.filter(item => item.eventUid === eventId);
  
    const uniqueUsers = filtered.reduce((acc: eventclick[], current) => {
      const exists = acc.find(user => user.email === current.email);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
  
    return uniqueUsers.length;
  }

  formatDate(value: any): Date | null {
    if (!value) return null;
    return value.toDate ? value.toDate() : value;
  }
}
