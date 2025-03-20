export interface event {
    active?: boolean;
    date?: Date;  
    name?:string;
    description?:string;
    imageURL?:string;
    lat?:string;
    lng?: string;
    address?:string;
    startTime?: Date; 
    endTime?: Date;    
    customerId?:string;    
    id:string;
}