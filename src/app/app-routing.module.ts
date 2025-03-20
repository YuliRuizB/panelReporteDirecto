import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { InitialLayoutComponent } from './layout/initial-layout/initial-layout.component';
import { EventsComponent } from './pages/events/events.component';
import { EvidenceComponent } from './pages/evidence/evidence.component';
import { UsersComponent } from './pages/users/users.component';
import { MyprofileComponent } from './pages/myprofile/myprofile.component';
import { RoleComponent } from './pages/role/role.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { PromotionsComponent } from './pages/promotions/promotions.component';

const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' },
  {
    path: '',
    component: InitialLayoutComponent,
    children: [    
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },  
      { path: 'evidence', component: EvidenceComponent },
      { path: 'welcome', component: WelcomeComponent },
      { path: 'events', component:  EventsComponent },
      { path: 'users', component:  UsersComponent },
      { path: 'myprofile', component: MyprofileComponent },
      { path: 'role', component: RoleComponent },
      { path: 'profiles', component: ProfilesComponent },
      { path: 'promotions', component:  PromotionsComponent }
    ]
  },
  {
    path: 'authentication',
    loadChildren: () => import('../app/authentication/authentication-routing,module').then(m => m.AuthenticationRoutingModule)    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
