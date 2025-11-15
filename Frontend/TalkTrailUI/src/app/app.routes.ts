import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ChatPage } from './chat/chat.page';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'chat', component: ChatPage },
    { path: '**', redirectTo: ''}
];
