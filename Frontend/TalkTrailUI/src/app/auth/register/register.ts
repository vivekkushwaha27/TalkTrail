import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  username = '';
  password = '';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {

    }
  }

  register() {
    if (!this.username || !this.password) {
      alert('Please enter valid username & password');
      return;
    }

    const user = {
      username: this.username?.trim(),
      password: this.password?.trim()
    };
    this.authService.signup(user).subscribe({
      next: (response) => {
        alert(response);
        console.log(response);
      },
      error: (error) => {
        alert(error?.error?.message);
      }
    });
  }
}
