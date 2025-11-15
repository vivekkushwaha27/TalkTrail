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

  searchUsers(query: string): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/auth/search?query=${query}`,
      this.getHeaders()
    );
  }
 

  getChatMessages(userId: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/messages/conversation/${userId}`,
      this.getHeaders()
    );
  }

  sendMessage(receiverId: number, message: string): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/api/messages/send`,
      { receiver_id: receiverId, message },
      this.getHeaders()
    );
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete(
      `${environment.BASE_URL}/api/messages/${messageId}`,
      this.getHeaders()
    );
  }


  getGroups(): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/groups`,
      this.getHeaders()
    );
  }

  createGroup(name: string, members: number[]): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/api/groups`,
      { name, members },
      this.getHeaders()
    );
  }

  addMembers(groupId: number, members: number[]): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/api/groups/${groupId}/add-members`,
      { members },
      this.getHeaders()
    );
  }



  getGroupMessages(groupId: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/groups/${groupId}/messages`,
      this.getHeaders()
    );
  }

  sendGroupMessage(groupId: number, message: string): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/api/groups/${groupId}/messages`,
      { message },
      this.getHeaders()
    );
  }

  deleteGroupMessage(groupId: number, msgId: number): Observable<any> {
    return this.http.delete(
      `${environment.BASE_URL}/api/groups/${groupId}/messages/${msgId}`,
      this.getHeaders()
    );
  }
}
