import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { finalize, map, Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { NzMessageService } from 'ng-zorro-antd/message';
import { myProfileService } from '../../services/myprofile.service';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrl: './myprofile.component.css'
})

export class MyprofileComponent {
  profileForm: FormGroup;
  authService = inject(AuthenticationService);
  myprofileService = inject(myProfileService);
  task: AngularFireUploadTask | undefined;
  uploadPercent: Observable<number> | undefined;
  uploadvalue: number = 0;
  downloadURL: Observable<string> | undefined;  
  snapshot: Observable<any> | undefined;  
  UploadedFileURL: Observable<string> | undefined;
  images: Observable<any[]> | undefined;
  uploading: boolean = false;
  bucketPath: string = 'profile/';
  user:  any ;

  constructor(private fb: FormBuilder,
    private bucketStorage: AngularFireStorage,
    private messageService: NzMessageService
  ) {
    this.profileForm = this.fb.group({
      photoURL: [''],
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      secondLastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required]],
      colony: ['', [Validators.required]],
      town: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      role: [{ value: '', disabled: true }]
    });

    this.authService.user.subscribe((user: any) => {      
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name || '',
          lastName: user.lastName || '',
          secondLastName: user.secondLastName || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          colony: user.colony || '',
          postalCode: user.postalCode || '',
          email: user.email || '',
          role: 'Admin',
          town :user.town || '',
          state:user.state || '',
          photoURL: user.photoURL || 'assets/avatar.png',
        });
      }
    });
  }
  submitForm(): void {
    if (this.profileForm.valid) {     
      this.myprofileService.updateUser(this.user.uid, this.profileForm.value)
      .then(() => {       
        this.refreshUserData();
      });
    } 
  }

  refreshUserData() {
    this.myprofileService.getUserData(this.user.uid).subscribe((updatedUser) => {
 
      if (updatedUser) {
        this.user = updatedUser;
        this.profileForm.patchValue({
          name: updatedUser?.name || '',
          lastName: updatedUser?.lastName || '',
          secondLastName: updatedUser?.secondLastName || '',
          phoneNumber: updatedUser?.phoneNumber || '',
          address: updatedUser?.address || '',
          colony: updatedUser?.colony || '',
          postalCode: updatedUser?.postalCode || '',
          email: updatedUser?.email || '',
          town :updatedUser?.town || '',
          state:updatedUser?.state || '',
          role: 'Admin',
          photoURL: updatedUser?.photoURL || 'assets/avatar.png',
        });
      }
    });
  }

  onFileSelected(info: { file: NzUploadFile }): void {
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
        // get notified when the download URL is available
        this.task.snapshotChanges().pipe(
          finalize(() => {
            this.uploading = false;
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe(async (url) => {
              this.updatePhotoURL(url);
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

sendMessage(type: string, message: string): void {
  this.messageService.create(type, message);
}
  async updatePhotoURL(url: any) {
    this.profileForm.controls['photoURL'].patchValue(url);
    this.myprofileService.updateUserAvatar(this.user.uid, url);
  }

}
 