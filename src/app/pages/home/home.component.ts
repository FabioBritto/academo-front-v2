import { Component, OnInit } from '@angular/core';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  groups: GroupDTO[] = [];

  constructor(private readonly groupsService: GroupsService) {}

  ngOnInit(): void {
    this.groupsService.listPaged({ page: 0, size: 12 }).subscribe({
      next: (page) => {
        this.groups = page.content;
      },
      error: () => {
        this.groups = [];
      }
    });
  }
}
