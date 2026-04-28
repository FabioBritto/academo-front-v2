import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subject-files-list',
  templateUrl: './subject-files-list.component.html',
  styleUrls: ['./subject-files-list.component.scss']
})
export class SubjectFilesListComponent {
  @Input() hasItems = false;

  @Input() emptyMessage = 'Nenhum arquivo por enquanto.';
}
