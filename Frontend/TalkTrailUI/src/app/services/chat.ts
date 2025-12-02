import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
      })
    };
  } 

  getChatMessages(userId: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/messages/conversation/${userId}`,
      this.getHeaders()
    );
  }

  sendMessage(receiverId: number, message: string): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/messages/send`,
      { receiverId: receiverId, message: message },
      this.getHeaders()
    );
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete(
      `${environment.BASE_URL}/messages/${messageId}`,
      this.getHeaders()
    );
  }


  getGroups(): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/groups`,
      this.getHeaders()
    );
  }

  createGroup(name: string, members: number[]): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/groups`,
      { name, members },
      this.getHeaders()
    );
  }

  addMembers(groupId: number, members: number[]): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/groups/${groupId}/add-members`,
      { members },
      this.getHeaders()
    );
  }



  getGroupMessages(groupId: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/groups/${groupId}/messages`,
      this.getHeaders()
    );
  }

  sendGroupMessage(groupId: number, message: string): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/groups/${groupId}/messages`,
      { message },
      this.getHeaders()
    );
  }

  deleteGroupMessage(groupId: number, msgId: number): Observable<any> {
    return this.http.delete(
      `${environment.BASE_URL}/groups/${groupId}/messages/${msgId}`,
      this.getHeaders()
    );
  }
}
