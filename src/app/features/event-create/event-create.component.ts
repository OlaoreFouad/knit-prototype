import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { KnitStateService } from '../../services/knit-state.service';
import { KnitEvent } from '../../models/event';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent {
  knitId: string;
  constructor(
    route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly state: KnitStateService,
    private readonly router: Router
  ) {
    this.knitId = route.snapshot.paramMap.get('id')!;
  }

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: [''],
    dateIso: ['', Validators.required],
    time: ['', Validators.required],
    location: ['']
  });

  get mapUrl(): string {
    const seed = encodeURIComponent(this.form.value.location || 'map');
    return `https://picsum.photos/seed/${seed}/800/400`;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const created = this.state.createEvent(this.knitId, {
      title: v.title!,
      description: v.description || '',
      dateIso: v.dateIso!,
      time: v.time!,
      location: v.location || '',
      hostName: 'You',
      imageUrl: this.mapUrl
    } as Omit<KnitEvent, 'id' | 'knitId' | 'createdAt'>);
    this.router.navigate(['/knit', this.knitId, 'events', created.id, 'summary']);
  }
}


