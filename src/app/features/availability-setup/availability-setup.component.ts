import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { Knit } from '../../models/knit';
import { Availability } from '../../models/availability';

interface DateOption {
  key: string; // YYYY-MM-DD
  label: string; // Mon, Jan 1
}

@Component({
  selector: 'app-availability-setup',
  templateUrl: './availability-setup.component.html',
  styleUrls: ['./availability-setup.component.scss']
})
export class AvailabilitySetupComponent implements OnInit {
  knit: Knit | null = null;
  step: 1 | 2 | 3 | 4 | 5 = 1;

  durationWeeks = 2;
  dateOptions: DateOption[] = [];
  selectedDateKeys = new Set<string>();
  timeSlots: string[] = [];
  selectedTimeSlots = new Set<string>();
  perDateTime: Record<string, Record<string, 'yes' | 'maybe' | 'no'>> = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly state: KnitStateService
  ) {}

  ngOnInit(): void {
    const knitId = this.route.snapshot.paramMap.get('id')!;
    this.knit = this.state.getKnitById(knitId);
    this.timeSlots = this.generateTimeSlots(8, 21); // 08:00 - 20:00 inclusive
    this.buildDateOptions();
    const existing = this.state.getSelfAvailability(knitId);
    if (existing) {
      existing.selectedDateKeys.forEach(k => this.selectedDateKeys.add(k));
      existing.selectedTimeSlots.forEach(t => this.selectedTimeSlots.add(t));
      if (existing.perDateTime) {
        this.perDateTime = existing.perDateTime;
      }
      // infer duration weeks from expiry if in the future
      const msLeft = existing.expiresAt - Date.now();
      const weeks = Math.max(1, Math.round(msLeft / (7 * 24 * 60 * 60 * 1000)));
      this.durationWeeks = Math.min(8, weeks);
    }
  }

  get selectedTimes(): string[] {
    return Array.from(this.selectedTimeSlots.values());
  }

  buildDateOptions(): void {
    const today = new Date();
    const totalDays = this.durationWeeks * 7;
    const opts: DateOption[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      opts.push({ key, label });
    }
    this.dateOptions = opts;
    // drop selections outside window
    const valid = new Set(opts.map(o => o.key));
    this.selectedDateKeys.forEach(k => {
      if (!valid.has(k)) this.selectedDateKeys.delete(k);
    });
    this.syncPerDateTime();
  }

  generateTimeSlots(startHour: number, endHour: number): string[] {
    const slots: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      const hour = `${h}`.padStart(2, '0');
      slots.push(`${hour}:00`);
    }
    return slots;
  }

  setDuration(weeks: number): void {
    this.durationWeeks = weeks;
    this.buildDateOptions();
  }

  toggleDate(key: string): void {
    if (this.selectedDateKeys.has(key)) this.selectedDateKeys.delete(key);
    else this.selectedDateKeys.add(key);
    this.syncPerDateTime();
  }

  toggleTime(slot: string): void {
    if (this.selectedTimeSlots.has(slot)) this.selectedTimeSlots.delete(slot);
    else this.selectedTimeSlots.add(slot);
    this.syncPerDateTime();
  }

  syncPerDateTime(): void {
    // Ensure perDateTime has entries for selected dates and times
    const selectedDates = Array.from(this.selectedDateKeys.values());
    const selectedTimes = Array.from(this.selectedTimeSlots.values());
    const next: Record<string, Record<string, 'yes' | 'maybe' | 'no'>> = {};
    for (const dateKey of selectedDates) {
      const existingTimes = this.perDateTime[dateKey] ?? {};
      const map: Record<string, 'yes' | 'maybe' | 'no'> = {};
      for (const t of selectedTimes) {
        map[t] = existingTimes[t] ?? 'maybe';
      }
      next[dateKey] = map;
    }
    this.perDateTime = next;
  }

  setStatus(dateKey: string, time: string, status: 'yes' | 'maybe' | 'no'): void {
    if (!this.perDateTime[dateKey]) this.perDateTime[dateKey] = {};
    this.perDateTime[dateKey][time] = status;
  }

  next(): void {
    if (this.step === 1) this.step = 2;
    else if (this.step === 2) this.step = 3;
    else if (this.step === 3) this.step = 4;
    else if (this.step === 4) this.step = 5;
  }

  back(): void {
    if (this.step === 5) this.step = 4;
    else if (this.step === 4) this.step = 3;
    else if (this.step === 3) this.step = 2;
    else if (this.step === 2) this.step = 1;
  }

  save(): void {
    if (!this.knit) return;
    const expiresAt = Date.now() + this.durationWeeks * 7 * 24 * 60 * 60 * 1000;
    const payload: Omit<Availability, 'owner' | 'knitId' | 'createdAt' | 'updatedAt'> = {
      expiresAt,
      selectedDateKeys: Array.from(this.selectedDateKeys),
      selectedTimeSlots: Array.from(this.selectedTimeSlots),
      perDateTime: this.perDateTime
    };
    this.state.saveSelfAvailability(this.knit.id, payload);
    this.router.navigate(['/knit', this.knit.id]);
  }
}


