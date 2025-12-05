import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { Knit } from '../../models/knit';

interface EventCard {
  id: string;
  title: string;
  description: string;
  hostName: string;
  dateIso: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string; // HH:mm
  location: string;
  attendees: string[]; // names
  recurring: boolean;
  recurrence?: {
    type: 'weekly';
    interval: number; // 1 => weekly, 2 => every 2 weeks
    weekday?: number; // 0-6, Sun-Sat
  };
  imageUrl: string;
}

@Component({
  selector: 'app-knit-events',
  templateUrl: './knit-events.component.html',
  styleUrls: ['./knit-events.component.scss']
})
export class KnitEventsComponent implements OnInit {
  knit: Knit | null = null;
  activeTab: 'upcoming' | 'past' = 'upcoming';
  events: EventCard[] = [];

  constructor(private readonly route: ActivatedRoute, private readonly state: KnitStateService) {}
  ngOnInit(): void {
    const knitId = this.route.snapshot.paramMap.get('id')!;
    this.knit = this.state.getKnitById(knitId);
    this.events = this.generateMockEvents();
  }

  get visibleEvents(): EventCard[] {
    const now = Date.now();
    const list = this.events.filter(ev => {
      const startsAt = new Date(`${ev.dateIso}T${ev.time}:00`).getTime();
      return this.activeTab === 'upcoming' ? startsAt >= now : startsAt < now;
    });
    return list.sort((a, b) => {
      const aMs = new Date(`${a.dateIso}T${a.time}:00`).getTime();
      const bMs = new Date(`${b.dateIso}T${b.time}:00`).getTime();
      return this.activeTab === 'upcoming' ? aMs - bMs : bMs - aMs;
    });
  }

  hostInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase() || (name[0] ?? '?').toUpperCase();
  }

  formatAttendees(attendees: string[]): string {
    if (!attendees || attendees.length === 0) return 'Be the first to RSVP';
    if (attendees.length === 1) return `${attendees[0]} is going`;
    if (attendees.length === 2) return `${attendees[0]} and ${attendees[1]} are going`;
    return `${attendees[0]}, ${attendees[1]} and ${attendees.length - 2} other${attendees.length - 2 > 1 ? 's' : ''} are going`;
  }

  recurrenceBadge(ev: EventCard): string {
    if (!ev.recurrence) return 'Recurring';
    if (ev.recurrence.type === 'weekly') {
      if (ev.recurrence.interval > 1) {
        return `recurring every ${ev.recurrence.interval} weeks`;
      }
      // interval === 1
      const weekday =
        typeof ev.recurrence.weekday === 'number'
          ? this.weekdayName(ev.recurrence.weekday)
          : this.weekdayName(new Date(ev.dateIso + 'T00:00:00').getDay());
      return `recurring every ${weekday}`;
    }
    return 'recurring';
  }

  private weekdayName(idx: number): string {
    const base = new Date(Date.UTC(2024, 0, 7 + idx)); // 2024-01-07 is Sunday
    return base.toLocaleDateString(undefined, { weekday: 'long' });
  }

  private generateMockEvents(): EventCard[] {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const dayOffset = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
    const make = (
      id: string,
      offset: number,
      time: string,
      title: string,
      desc: string,
      hostName: string,
      location: string,
      attendees: string[],
      recurring: boolean,
      recurrence?: EventCard['recurrence']
    ): EventCard => {
      const date = dayOffset(offset);
      return {
        id,
        title,
        description: desc,
        hostName,
        dateIso: fmt(date),
        time,
        location,
        attendees,
        recurring,
        recurrence,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(id)}/800/400`
      };
    };
    return [
      make('brunch-sat', 2, '11:00', 'Saturday Brunch', 'Casual get-together at the new spot.', 'Amaka Bello', 'Bloom Cafe, Downtown', ['Demola', 'John', 'Zainab', 'Jess'], false),
      make('run-club', 5, '07:30', 'Morning Run Club', '5k around the park, all paces welcome.', 'Tunde O.', 'City Park Entrance', ['Ade', 'Mayowa', 'Kiki'], true, { type: 'weekly', interval: 1, weekday: dayOffset(5).getDay() }),
      make('book-club', -3, '18:00', 'Book Club: Chapter 5', 'Discussing key themes and characters.', 'Chioma A.', 'Loft Lounge', ['Ugo', 'Ben'], true, { type: 'weekly', interval: 2, weekday: dayOffset(-3).getDay() }),
      make('game-night', -10, '19:30', 'Board Game Night', 'Bring your favorite game, snacks provided.', 'Ifeanyi N.', 'The Nook', ['Sola', 'Dami', 'Rose', 'Ken', 'Ada'], false),
      make('friday-dinner', 9, '20:00', 'Friday Dinner', 'Family-style dinner at Taverna.', 'Zainab Ali', 'Taverna West', ['John', 'Lanre'], false),
      make('yoga-sunrise', -1, '06:45', 'Sunrise Yoga', 'Bring a mat; beginners welcome.', 'Kemi T.', 'Rooftop Studio', ['Mo', 'Nadia', 'Amaka'], false),
    ];
  }
}


