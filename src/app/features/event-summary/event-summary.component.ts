import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { KnitEvent } from '../../models/event';

interface PersonStatus {
  name: string;
  status: 'yes' | 'maybe' | 'no';
}

@Component({
  selector: 'app-event-summary',
  templateUrl: './event-summary.component.html',
  styleUrls: ['./event-summary.component.scss']
})
export class EventSummaryComponent implements OnInit {
  knitId!: string;
  eventId!: string;
  event: KnitEvent | null = null;
  yes: PersonStatus[] = [];
  maybe: PersonStatus[] = [];
  no: PersonStatus[] = [];
  showSuggestions = false;
  notified = false;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly state: KnitStateService) {}

  ngOnInit(): void {
    this.knitId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.event = this.state.getEvent(this.knitId, this.eventId);
    this.generateMockStatuses();
  }

  private generateMockStatuses(): void {
    // derive names from invite emails, else fallback
    const key = `knit:inviteEmails:${this.knitId}`;
    const raw = localStorage.getItem(key);
    const emails: Array<{ email: string }> = raw ? JSON.parse(raw) : [];
    const names = emails.length
      ? emails.map(e => e.email.split('@')[0]).slice(0, 8)
      : ['Demola', 'John', 'Zainab', 'Jess', 'Ade', 'Kiki', 'Rose', 'Ken'];
    const statuses: PersonStatus[] = names.map(n => {
      const r = Math.random();
      return { name: n, status: r < 0.5 ? 'yes' : r < 0.8 ? 'maybe' : 'no' };
    });
    this.yes = statuses.filter(s => s.status === 'yes');
    this.maybe = statuses.filter(s => s.status === 'maybe');
    this.no = statuses.filter(s => s.status === 'no');
  }

  notifyFriends(): void {
    this.notified = true;
    // prototype: no-op
  }

  goToDetails(): void {
    this.router.navigate(['/knit', this.knitId, 'events', this.eventId]);
  }
}


