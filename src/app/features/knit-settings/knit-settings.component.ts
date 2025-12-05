import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { Knit } from '../../models/knit';

@Component({
  selector: 'app-knit-settings',
  templateUrl: './knit-settings.component.html',
  styleUrls: ['./knit-settings.component.scss']
})
export class KnitSettingsComponent implements OnInit {
  knit: Knit | null = null;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly state: KnitStateService
  ) {}
  ngOnInit(): void {
    const knitId = this.route.snapshot.paramMap.get('id')!;
    this.knit = this.state.getKnitById(knitId);
  }
  openAvailability(): void {
    if (!this.knit) return;
    this.router.navigate(['/knit', this.knit.id, 'settings', 'availability']);
  }
}


