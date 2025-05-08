import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { CommonModule, registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { LoginComponent } from './authentication/login/login.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { InitialLayoutComponent } from './layout/initial-layout/initial-layout.component';
import { environment } from './environments/enviroment.prod';
import { RouterModule } from '@angular/router';
import { EventsComponent } from './pages/events/events.component';
import { EvidenceComponent } from './pages/evidence/evidence.component';
import { MyprofileComponent } from './pages/myprofile/myprofile.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { PromotionsComponent } from './pages/promotions/promotions.component';
import { RoleComponent } from './pages/role/role.component';
import { UsersComponent } from './pages/users/users.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider'; 
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import es from '@angular/common/locales/es';
import { es_ES } from 'ng-zorro-antd/i18n';
import { LockOutline, UserOutline } from '@ant-design/icons-angular/icons';
import { BajaUsuarioComponent } from './pages/baja-usuario/baja-usuario.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ClientComponent } from './authentication/client/client.component';
import { TermsComponent } from './pages/terms/terms.component';
import { ConfigurationsComponent } from './pages/configurations/configurations.component';
import { SuppliesComponent } from './pages/supplies/supplies.component';
import { MapComponent } from './pages/map/map.component';
import { GoogleMapsModule } from '@angular/google-maps';


registerLocaleData(es);


@NgModule({
  declarations: [
    AppComponent,   
    LoginComponent, 
    EventsComponent,
    EvidenceComponent,
    MyprofileComponent,
    ProfilesComponent,
    PromotionsComponent,
    RoleComponent,
    UsersComponent,
    WelcomeComponent,
    ForgotPasswordComponent,
    InitialLayoutComponent,
    LoginComponent,
    BajaUsuarioComponent,
    PrivacyComponent,
    ClientComponent,
    TermsComponent,
    ConfigurationsComponent,
    SuppliesComponent,
    MapComponent
  ],
  imports: [
    NzIconModule,
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    FormsModule,
    CommonModule,   
    NzPageHeaderModule,
    NzButtonModule,
    NzCardModule,
    NzMenuModule,    
    NzLayoutModule,
    RouterModule,    
    NzTableModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFirestoreModule,
    NzStatisticModule,
    NzAvatarModule,
    NzGridModule ,
    NzDividerModule,
    ReactiveFormsModule,
    NzFormModule,
    NzMenuModule,
    NzIconModule,
    NzSpaceModule,  
    NzBreadCrumbModule,
    NzResultModule,
    NzModalModule,
    NzNotificationModule,
    NzDrawerModule,
    NzCalendarModule,
    NzTransferModule,
    NzListModule, 
    NzQRCodeModule,
    NzInputModule,
    NzDatePickerModule,
    NzRadioModule,
    NzCheckboxModule,  
    NzPaginationModule,
    NzMessageModule,    
    NzEmptyModule,    
    NzStepsModule,
    NzBadgeModule,
    NzSpinModule,
    NzSwitchModule,
    NzUploadModule,
    NzDescriptionsModule,
    NzTreeModule,
    NzCollapseModule,
    NzDropDownModule,
    NzBackTopModule, 
    NzToolTipModule,
    NzTagModule,
    NzTimelineModule,
    NzSelectModule,   
    NzSkeletonModule,
    NzTabsModule,
    NzInputNumberModule,
    NzProgressModule,
    NzTimePickerModule,
    NzPopconfirmModule,
    HttpClientModule ,
    GoogleMapsModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: es_ES },
    provideAnimationsAsync(),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


