import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface MockMathSubject {
  name: string;
  filesCount: number;
}

@Component({
  selector: 'app-files-free-mock',
  templateUrl: './files-free-mock.component.html',
  styleUrls: ['./files-free-mock.component.scss']
})
export class FilesFreeMockComponent {
  readonly subjects: MockMathSubject[] = [
    { name: 'Matemática - Cálculo I', filesCount: 12 },
    { name: 'Matemática - Álgebra Linear', filesCount: 8 },
    { name: 'Matemática - Geometria Analítica', filesCount: 5 },
    { name: 'Matemática - Probabilidade', filesCount: 9 }
  ];

  constructor(private readonly router: Router) {}

  goToPremium(): void {
    void this.router.navigate(['/app/profile-subscription']);
  }
}
