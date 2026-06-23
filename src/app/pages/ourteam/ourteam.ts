import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  focus: string;
  photo: string;
}

@Component({
  selector: 'app-ourteam',
  imports: [CommonModule],
  templateUrl: './ourteam.html',
  styleUrl: './ourteam.css',
})
export class Ourteam {
  readonly defaultPhoto = '/assets/imagenes/sin_foto.png';

  readonly teamMembers: TeamMember[] = [
    { name: 'Nadia Secades', role: 'Full-Stack Developer', focus: 'Organización', photo: '/assets/imagenes/nadia.jpeg' },
    { name: 'Andrea Martínez', role: 'Full-Stack Developer', focus: 'Diseño y UX', photo: '/assets/imagenes/andrea.jpg' },
    { name: 'Adrián Amat', role: 'Full-Stack Developer', focus: 'Enfoque analítico', photo: '/assets/imagenes/adrian.jpeg' },
    { name: 'Carlos Trujillano', role: 'Full-Stack Developer', focus: 'Frontend', photo: '/assets/imagenes/Carlos.jpeg' },
    { name: 'Diego De Haro', role: 'Full-Stack Developer', focus: 'Resolución de problemas', photo: '/assets/imagenes/sin_foto.png' },
    { name: 'Jose Redondo', role: 'Full-Stack Developer', focus: 'Backend', photo: '/assets/imagenes/sin_foto.png' },
    { name: 'Luis Osorio', role: 'Full-Stack Developer', focus: 'Integración', photo: '/assets/imagenes/luis.jpg' },
  ];
}
