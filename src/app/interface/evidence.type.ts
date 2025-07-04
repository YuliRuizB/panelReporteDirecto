export interface  Evidence {
  audioUrl?: string;
  colony?: string;
  date?: Date;
  description?: string;
  imageUrl?: string;
  idDoc?: string;
  lastName?: string;
  name?: string;
  secondLastName?: string;
  phoneNumber?: string;
  state?: string;
  title: string;
  town?: string;
  lat?: string;
  lng?: string;
  status?: string;
  evidenceType?:string;
  evidenceTypeName?:string;
  lngEvidence:number;
  latEvidence:number;
  dateTimeStamp?:Date;
}

export interface evidenceType {
  active: boolean;
  customerId: string;
  name:string;
  uid:string;
}