import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { KnitEvent } from '../../models/event';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  knitId!: string;
  eventId!: string;
  event: KnitEvent | null = null;
  kitItems: Array<{ id: string; label: string; assignedTo?: string }> = [];
  newItem = '';

  constructor(private readonly route: ActivatedRoute, private readonly state: KnitStateService) {}

  ngOnInit(): void {
    this.knitId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.event = this.state.getEvent(this.knitId, this.eventId);
    this.refreshKit();
  }

  refreshKit(): void {
    this.kitItems = this.state.listKitItems(this.eventId);
  }

  addKitItem(): void {
    const label = (this.newItem || '').trim();
    if (!label) return;
    this.state.addKitItem(this.eventId, label);
    this.newItem = '';
    this.refreshKit();
  }

  toggleAssign(itemId: string): void {
    this.state.toggleAssignKitItem(this.eventId, itemId, 'You');
    this.refreshKit();
  }
}


