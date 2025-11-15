import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  username = '';
  password = '';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
     this.router.navigate(['/chat']);
    }
  }

  login() {
    const user = {
      username: this.username,
      password: this.password
    };
    this.authService.login(user).subscribe({
      next: (response) => {
        this.authService.setToken(response);
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        alert("Invalid login");
      }
    });
  }
}
