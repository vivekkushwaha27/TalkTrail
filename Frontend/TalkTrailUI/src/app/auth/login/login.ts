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
  loginBtnClicked: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
     this.router.navigate(['/chat']);
    }
  }

  login() {    
    if (!this.username?.trim() || !this.password?.trim()) {
      console.log('Please enter a valid username and password');
      return;
    }
    if(this.loginBtnClicked) return;
    this.loginBtnClicked = true;

    const user = {
      username: this.username,
      password: this.password
    };
    this.authService.login(user).subscribe({
      next: (response) => {
        this.authService.setToken(response);
        this.loginBtnClicked = false;
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        alert("Invalid login");
        this.loginBtnClicked = false;
      }
    });
  }
}
