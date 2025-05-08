export interface supplier {
    active?: boolean;
    date?: Date;  
    name?:string;
    description?:string; 
    cost:number;  
    id:string;
    uid:string;
    totalAmount?:number;
    actualAmount?:number
    isEventAssociate?:boolean;
    eventUid:string;
    customerId:string;
}

export interface supplieList {
    active?: boolean;
    date?: Date;  
    name?:string;
    description?:string;   
    id:string;
    uid:string;
    amount?:number;
    eventUid:string;
    userid:string;
    customerId:string;
}

