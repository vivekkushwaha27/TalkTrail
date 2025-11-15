import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() user: any;
  @Input() users: any[] = [];
  @Input() groups: any[] = [];
  @Input() selectedUser: any;
  @Input() selectedGroup: any;

  @Output() selectUser = new EventEmitter<any>();
  @Output() selectGroup = new EventEmitter<any>();
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() searchEvent = new EventEmitter<string>();

  activeTab: 'users' | 'groups' = 'users';
  searchQuery = '';

  switchTab(tab: 'users' | 'groups') {
    this.activeTab = tab;
    if (tab === 'groups') {
      this.searchQuery = '';
      this.searchEvent.emit('');
    }
  }

  onLogout() {
    this.logoutEvent.emit();
  }

  onSearch() {
    this.searchEvent.emit(this.searchQuery);
  }
}
