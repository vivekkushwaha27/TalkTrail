import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss'
})
export class ChatWindow implements OnChanges {

  @Input() currentUser: any;
  @Input() selectedUser: any;
  @Input() selectedGroup: any;
  @Input() messages: any[] = [];

  @Output() sendMessage = new EventEmitter<string>();
  @Output() deleteMessage = new EventEmitter<any>();

  newMessage = '';

  @ViewChild('bottomRef') bottomRef!: ElementRef;

  ngOnChanges(changes: SimpleChanges): void {
    // scroll to bottom whenever messages change
    setTimeout(() => {
      const el = this.bottomRef?.nativeElement;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }

  onSend() {
    if (!this.newMessage.trim()) return;
    this.sendMessage.emit(this.newMessage);
    this.newMessage = '';
  }

  onDelete(msg: any) {
    this.deleteMessage.emit(msg);
  }

  getTitle(): string {
    if (this.selectedUser) return `Chat with ${this.selectedUser.username}`;
    if (this.selectedGroup) return this.selectedGroup.name;
    return 'Select a user or group to start chatting';
  }
}
