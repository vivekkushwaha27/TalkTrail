import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  username = '';
  password = '';
  registerBtnClicked: boolean = false;

  constructor(private router: Router, private authService: AuthService, private loaderService: LoaderService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    }
  }

  register() {
    if (!this.username?.trim() || !this.password?.trim()) {
      alert('Please enter a valid username and password');
      return;
    }
    if(this.registerBtnClicked) return;
    this.registerBtnClicked = true;

    this.loaderService.show();

    const user = {
      username: this.username?.trim(),
      password: this.password?.trim()
    };

    this.authService.signup(user).subscribe({
      next: (response) => {
        alert(response);
        this.registerBtnClicked = false;
        this.loaderService.hide();
      },
      error: (error) => {
        alert(error?.error?.message);
        this.registerBtnClicked = false;
        this.loaderService.hide();
      }
    });
  }
}
