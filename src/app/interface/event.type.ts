export interface event {
    active?: boolean;
    date?: Date;  
    name:string;
    description?:string;
    imageURL?:string;
    lat?:string;
    lng?: string;
    address?:string;
    startTime?: Date; 
    endTime?: Date;    
    customerId?:string;    
    id:string;
    uid:string;
    attendanceControl:string;
}

export interface eventAtt {
    customerId:string;
    dateRegister:Date;
    date:Date;
    eventId:string;
    name:string;
    lastName:string;
    secondLastName:string;
    uidUser:string;
}

export interface eventclick {
    customerId:string;
    date:Date;    
    eventUid:string;
    name:string;
    eventName:string;
    lastName:string;
    secondLastName:string;
    uidUser:string;
    eventDate:Date;
    email:string;
}