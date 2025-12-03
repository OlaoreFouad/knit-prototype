import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { Knit } from '../../models/knit';

@Component({
  selector: 'app-knit-friends',
  templateUrl: './knit-friends.component.html',
  styleUrls: ['./knit-friends.component.scss']
})
export class KnitFriendsComponent implements OnInit {
  knit: Knit | null = null;
  constructor(private readonly route: ActivatedRoute, private readonly state: KnitStateService) {}
  ngOnInit(): void {
    const knitId = this.route.snapshot.paramMap.get('id')!;
    this.knit = this.state.getKnitById(knitId);
  }
}


