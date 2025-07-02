import { Component, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Evidence } from '../../interface/evidence.type';
import { evidenceService } from '../../services/evidence.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthenticationService } from '../../services/authentication.service';
import { NotificationService } from '../../services/notifications.service';
import { lastValueFrom, map, take } from 'rxjs';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  evidenceService = inject(evidenceService);
  authService = inject(AuthenticationService);
  center = { lat: 25.6866, lng: -100.3161 };
  selectedMarker: any;
  zoom = 11;
  listOfData: Evidence[] = [];
  totEvidence: number = 0;
  evidenceTypeList: any = [];
  totEvidencePending: number = 0;
  totEvidenceReview: number = 0;
  totEvidenceApproved: number = 0;
  totEvidenceReject: number = 0;
  totEvidenceFinalize: number = 0;
  selectEvidenceType: string = 'Todos';
  filteredData: Evidence[] = [];
  filteredDataFilter: Evidence[] = [];
  user: any;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren(MapMarker) mapMarkers!: QueryList<MapMarker>
  

  constructor(private message: NzMessageService, private notificationService: NotificationService) {

    this.authService.user.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.loadEvidences(this.user.customerId);
        this.LoadEvidenceType(this.user.customerId);
      } else {
        this.user = [];
      }
    });
  }

  ngOnInit() {
    this.filteredData = this.listOfData; // Mostrar todos al inicio
    this.filteredDataFilter = this.listOfData;
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
      this.filteredData = this.listOfData;
      this.filteredDataFilter = this.filteredData;  
      this.updatePendingCount();
      
    });
  }

  LoadEvidenceType(customerId: string) {
    this.evidenceService.getEvidenceType(customerId).pipe(
      map((actions: any) => actions.map((a: any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {
          id,
          ...data
        };
      }))
    ).subscribe((evidenceList: Evidence[]) => {
      this.evidenceTypeList = evidenceList;
    });
  }
  selectEvidenceTypeOption() {      
    this.filteredData = this.filteredDataFilter.filter((r: any) => 
      r.evidenceTypeUid.trim() === this.selectEvidenceType.trim()
    );  
  }
  filterFinalized(): void {
    this.filteredData = this.listOfData.filter(item => item.status === 'FINALIZED');
    this.filteredDataFilter = this.filteredData;
  }
  filterTot(): void {
    this.selectEvidenceType = 'Todos';
    this.filteredData = this.listOfData;
    this.filteredDataFilter = this.filteredData;
  }

  filterPending(): void {
    this.selectEvidenceType = 'Todos';
    this.filteredData = this.listOfData.filter(item => item.status === 'PENDING');
    this.filteredDataFilter = this.filteredData;
  }

  filterReview(): void {
    this.selectEvidenceType = 'Todos';
    this.filteredData = this.listOfData.filter(item => item.status === 'REVIEW');
    this.filteredDataFilter = this.filteredData;
  }

  filterApproved(): void {
    this.selectEvidenceType = 'Todos';
    this.filteredData = this.listOfData.filter(item => item.status === 'APPROVED');
    this.filteredDataFilter = this.filteredData;
  }

  filterReject(): void {
    this.selectEvidenceType = 'Todos';
    this.filteredData = this.listOfData.filter(item => item.status === 'REJECT');
    this.filteredDataFilter = this.filteredData;
  }

  updatePendingCount(): void {
    this.totEvidencePending = this.listOfData.filter(item => item.status === 'PENDING').length;
    this.totEvidence = this.listOfData.length;
    this.totEvidenceReview = this.listOfData.filter(item => item.status === 'REVIEW').length;
    this.totEvidenceApproved = this.listOfData.filter(item => item.status === 'APPROVED').length;
    this.totEvidenceReject = this.listOfData.filter(item => item.status === 'REJECT').length;
    this.totEvidenceFinalize = this.listOfData.filter(item => item.status === 'FINALIZED').length;
  }

  showInfoWindow(index: number, item: any) {
    const markerArray = this.mapMarkers.toArray();
    const marker = markerArray[index];
    if (marker) {
      this.selectedMarker = item;
      this.infoWindow.open(marker);
    } else {
      console.error("No se encontró el marcador en el índice:", index);
    }
  }

  formatDate(value: any): Date | null {
    if (!value) return null;
  
    // Firestore Timestamp
    if (value.toDate) return value.toDate();
  
    // Si ya es Date
    if (value instanceof Date) return value;
  
    // Si es string o número
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }


}
