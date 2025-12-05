import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat';
import { ChatWindow } from './components/chat-window/chat-window';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatWindow],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit, OnDestroy {

  userName: string | null = null;
  users: any[] = [];
  groups: any[] = [];
  selectedUser: any = null;
  selectedGroup: any = null;
  messages: any[] = [];

  private pollIntervalId: any = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.userName = this.authService.getUserName();
    this.loadAllUsers();
  }

  ngOnDestroy(): void {
    this.clearPolling();
  }

  loadAllUsers() {
    this.loaderService.show();
    this.authService.getUsers().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res.users ?? [];
        this.users = [...data];
        this.cd.detectChanges();
        this.loaderService.hide();
      },
      error: (error) => {
        console.log('Error fetching users: ', error);
        this.loaderService.hide();
      }
    });
  }

  onSearchUsers(username: string) {
    const term = (username || '').trim();
    if (!term) {
      this.loadAllUsers();
      return;
    }
    this.loaderService.show();
    this.authService.getUserByUsername(term).subscribe({
      next: (res) => {
        this.users = Array.isArray(res) ? res : [res];
        this.cd.detectChanges();
        this.loaderService.hide();
      },
      error: (error) => {
        this.users = [];
        this.cd.detectChanges();
        alert(error.error || 'User not found');
        this.loaderService.hide();
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
      next: (res) => {
        this.messages = Array.isArray(res) ? res : res.messages || [];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log('Error fetching user messages', err);
      }
    });
  }

  fetchGroupMessages(groupId: number) {
    this.chatService.getGroupMessages(groupId).subscribe({
      next: (res) => (this.messages = Array.isArray(res) ? res : res.messages || []),
      error: (err) => console.log('Error fetching group messages', err)
    });
  }

  onSendMessage(text: string) {
    if (!text.trim()) return;

    if (this.selectedUser) {
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

  startPolling() {
    this.clearPolling();
    if (!(this.selectedUser || this.selectedGroup)) return;

    this.pollIntervalId = setInterval(() => {
      if (this.selectedUser) this.fetchUserMessages(this.selectedUser.id);
      if (this.selectedGroup) this.fetchGroupMessages(this.selectedGroup.id);
    }, 1000);
  }

  clearPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}
