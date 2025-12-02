import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat';
import { ChatWindow } from './components/chat-window/chat-window';
import { Sidebar } from './components/sidebar/sidebar';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, Sidebar, ChatWindow],
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.scss'
})
export class ChatPage implements OnInit, OnDestroy {

  user: any = "";
  users: any[] = [];
  groups: any[] = [];
  selectedUser: any = null;
  selectedGroup: any = null;
  messages: any[] = [];

  private pollIntervalId: any = null;

  constructor(private chatService: ChatService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.user = this.authService.getUserName();
    this.loadAllUsers();
    // this.loadGroups();
  }

  ngOnDestroy(): void {
    this.clearPolling();
  }

  loadAllUsers() {
    this.authService.getUsers().subscribe({
      next: (res) => this.users = Array.isArray(res) ? res : res.users ?? [],
      error: () => console.error('Error fetching users')
    });
  }

  loadGroups() {
    this.chatService.getGroups().subscribe({
      next: (res) => (this.groups = res),
      error: (err) => alert('Error fetching groups')
    });
  }

  onSearchUsers(username: string) {
    if (!username || username.trim() === '') {
      alert("Please enter a valid username");
      return;
    }
    this.authService.getUserByUsername(username.trim()).subscribe({
      next: (res) => {
        this.users = Array.isArray(res) ? res : [res];        
      },
      error: (error) => {
        this.users = [];
        alert(error.error);
      }
    });
  }

  onSelectUser(user: any) {
    this.selectedUser = user;
    this.selectedGroup = null;
    this.messages = [];
    this.fetchUserMessages(user.id);
    this.startPolling();
  }

  onSelectGroup(g: any) {
    this.selectedGroup = g;
    this.selectedUser = null;
    this.messages = [];
    this.fetchGroupMessages(g.id);
    this.startPolling();
  }

  onLogout() {
    this.authService.logout();
  }


  fetchUserMessages(userId: number) {
    this.chatService.getChatMessages(userId).subscribe({
      next: (res) => (this.messages = Array.isArray(res) ? res : res.messages || []),
      error: (err) => console.error('Error fetching user messages', err)
    });
  }

  fetchGroupMessages(groupId: number) {
    this.chatService.getGroupMessages(groupId).subscribe({
      next: (res) => (this.messages = Array.isArray(res) ? res : res.messages || []),
      error: (err) => console.error('Error fetching group messages', err)
    });
  }

  onSendMessage(text: string) {
    if (!text.trim()) return;

    if (this.selectedUser) {
      console.log(this.selectedUser,text);
      this.chatService.sendMessage(this.selectedUser.id, text).subscribe({
        next: (res) => {
          const msg = res.data || res;
          this.messages = [...this.messages, msg];
        },
        error: () => alert('Error sending message')
      });
    } else if (this.selectedGroup) {
      this.chatService.sendGroupMessage(this.selectedGroup.id, text).subscribe({
        next: (res) => {
          const msg = res.data || res;
          this.messages = [...this.messages, msg];
        },
        error: () => alert('Error sending group message')
      });
    }
  }

  onDeleteMessage(msg: any) {
    if (this.selectedUser) {
      this.chatService.deleteMessage(msg.id).subscribe({
        next: () => this.messages = this.messages.filter(m => m.id !== msg.id),
        error: () => alert('Error deleting message')
      });
    } else if (this.selectedGroup) {
      this.chatService.deleteGroupMessage(this.selectedGroup.id, msg.id).subscribe({
        next: () => this.messages = this.messages.filter(m => m.id !== msg.id),
        error: () => alert('Error deleting group message')
      });
    }
  }

  // POLLING 

  startPolling() {
    this.clearPolling();

    if (!(this.selectedUser || this.selectedGroup)) return;

    this.pollIntervalId = setInterval(() => {
      if (this.selectedUser) this.fetchUserMessages(this.selectedUser.id);
      if (this.selectedGroup) this.fetchGroupMessages(this.selectedGroup.id);
    }, 1000); // 1 second like your React code
  }

  clearPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}
