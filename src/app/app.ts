import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
<<<<<<< HEAD
import { HomeComponent } from "./components/home/home.component";
import { RegisterComponent } from './components/register/register.component';
=======
>>>>>>> origin/main

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, NavbarComponent, LoginModalComponent, FooterComponent, HomeComponent, RegisterComponent],
=======
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
>>>>>>> origin/main
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
