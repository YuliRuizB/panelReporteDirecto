import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { promotion } from '../../interface/promotion.type';
import { AuthenticationService } from '../../services/authentication.service';
import { promotionService } from '../../services/promotions.service';
import { finalize, map, Observable } from 'rxjs';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css'
})
export class PromotionsComponent {
  isVisible = false;
  isVisibleEdit= false;
  promList: promotion[] = [];
  promForm: FormGroup;
  isConfirmLoading = false
  isConfirmLoadingEdit = false;
  isUploading: boolean = false;
  user: any;
  selectedProm: any;
  promFormEdit: FormGroup;
  authService = inject(AuthenticationService);
  promService = inject(promotionService)
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
  bucketPath: string = 'promotions/';
  isListView: boolean = true; 

  constructor(private fb: FormBuilder,
    private bucketStorage: AngularFireStorage,
    private messageService: NzMessageService,
    private http: HttpClient
  ) {
    this.promForm = this.fb.group({
      active: [true],
      customerId: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],    
      endDate: [null, Validators.required],
      startDate: [null, Validators.required],      
      imageURL: [''],
      uid: ['']
    });

    this.promFormEdit = this.fb.group({
      active: [true],
      customerId: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      endDate: [null, Validators.required],
      startDate: [null, Validators.required],      
      imageURL: [''],
      uid: ['']
    });

    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.loadPromotions(this.user.customerId);
      } else {
        this.user = [];
      }
    });
  }

  loadPromotions(customerId: string) {
    this.promService.getPromotions(customerId).pipe(
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
    ).subscribe((promList: promotion[]) => {
      this.promList = promList;
    });
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


  handleCancel(): void {
    this.isVisible = false;
    this.isVisibleEdit = false;
  }

  showModal(): void {
    this.isVisible = true;
    this.promForm.reset();
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }

  togglePromStatus(prom: any): void {
    this.promService.toogleActiveProm(prom.uid, prom.active);
    this.sendMessage("sucess", "Se actualizó con el estatus de la promoción");
  }

  openEditModal(pId: string): void {
    this.promFormEdit = new FormGroup({
      title: new FormControl(''),
      description: new FormControl(''),
      endDate: new FormControl(null),      
      startDate: new FormControl(null),
      customerId: new FormControl(''),
      uid: new FormControl(''),
      imageURL: new FormControl(''),
    });

    this.selectedProm = this.promList.find(p => p.id === pId);
    if (this.selectedProm) {
      this.promFormEdit.patchValue({
        title: this.selectedProm.title,
        description: this.selectedProm.description,
        startDate: this.selectedProm.startDate,
        endDate: this.selectedProm.endDate,      
        customerId: this.selectedProm.customerId,
        imageURL: this.selectedProm.imageURL,
        uid: pId
      });
      this.isVisibleEdit = true;
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
                this.promForm.controls['imageURL'].patchValue(url);
                this.imagePreview = url;
              } else {
                this.promFormEdit.controls['imageURL'].patchValue(url);
                this.imagePreviewEdit = url;
              }
              this.sendMessage("sucess", "Se actualizó con éxito la imagen de perfil");
            });
          })
        ).subscribe();
      });
    }
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

  submitForm(): void { 
    if (this.promForm.valid ) {     
      this.promForm.controls['customerId'].patchValue(this.user.customerId);
      this.promService.addPromotion(this.promForm.value);
      this.isConfirmLoading = true;
      this.sendMessage('sucess','El evento se a creado con éxito');
      this.isVisible = false;
    }
  }

  submitFormEdit(): void {
    if (this.promFormEdit.valid && !this.isUploading) {      
      this.promFormEdit.controls['customerId'].patchValue(this.user.customerId);
      this.promService.editPromotion(this.promFormEdit.value, this.promFormEdit.get('uid')?.value);
      this.isConfirmLoadingEdit = true;
       this.sendMessage('sucess','El evento se a actualizado con éxito');
      this.isVisibleEdit = false;
    }
  }

  confirmDeleteProm(promId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      this.deleteProm(promId);
    }
  }

  deleteProm(promId: string): void {    
    this.promService.deleteProm(promId);
  }
}
