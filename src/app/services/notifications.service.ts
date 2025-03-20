import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject, Observable, retry, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private serverKey = '5SpKdN1DKUg1InkWqlXPBVQbSfS7_RZOOCKqkOxylLo'; // 🔥 Tu clave del servidor FCM
  private fcmUrl = 'https://fcm.googleapis.com/fcm/send';
  currentMessage = new BehaviorSubject<any>(null);
  private serverUrl = 'http://localhost:3000/sendPushNotificationSecond'; // URL del backend


  constructor(private http: HttpClient,private afMessaging: AngularFireMessaging) {}

  
  public sendPushNotification(title: string, description: string, token:string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }),
    };
    let api = `https://us-central1-reportedirecto-dfbf6.cloudfunctions.net/sendPushNotification`;
    return this.http.post(api, { title: title , description: description,  token:token}, httpOptions).pipe(
      retry(0),
    );

   
    
  }



}
