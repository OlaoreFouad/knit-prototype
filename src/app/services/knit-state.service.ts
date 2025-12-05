import { Injectable } from '@angular/core';
import { Knit } from '../models/knit';
import { Invite } from '../models/invite';
import { Availability } from '../models/availability';

type KnitMap = Record<string, Knit>;
type InviteMap = Record<string, Invite>;

@Injectable({
  providedIn: 'root'
})
export class KnitStateService {
  private readonly KNITS_KEY = 'knit:knits';
  private readonly INVITES_KEY = 'knit:invites';
  private availabilityKey(knitId: string): string {
    return `knit:availability:self:${knitId}`;
  }

  createKnit(params: { name: string; description?: string }): { knit: Knit; invite: Invite; inviteUrl: string } {
    const knitId = this.generateId('k');
    const now = Date.now();
    const knit: Knit = {
      id: knitId,
      name: params.name,
      description: params.description,
      createdAt: now,
      friendCountRange: '2-4'
    };

    const invite: Invite = {
      id: this.generateId('i'),
      knitId,
      createdAt: now
    };

    const knits = this.getKnitsMap();
    knits[knitId] = knit;
    this.setKnitsMap(knits);

    const invites = this.getInvitesMap();
    invites[invite.id] = invite;
    this.setInvitesMap(invites);

    const inviteUrl = this.buildInviteUrl(invite.id);
    return { knit, invite, inviteUrl };
  }
  updateKnit(knit: Knit): void {
    const knits = this.getKnitsMap();
    knits[knit.id] = knit;
    this.setKnitsMap(knits);
  }

  getKnitById(knitId: string): Knit | null {
    const knits = this.getKnitsMap();
    return knits[knitId] ?? null;
  }

  getInviteByKnitId(knitId: string): Invite | null {
    const invites = this.getInvitesMap();
    const found = Object.values(invites).find(i => i.knitId === knitId) || null;
    return found;
  }

  private buildInviteUrl(inviteId: string): string {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    return `${origin}/invite/${inviteId}`;
  }

  // Availability (self)
  saveSelfAvailability(knitId: string, data: Omit<Availability, 'owner' | 'knitId' | 'createdAt' | 'updatedAt'> & Partial<Pick<Availability, 'createdAt'>>): Availability {
    const now = Date.now();
    const existing = this.getSelfAvailability(knitId);
    const availability: Availability = {
      knitId,
      owner: 'self',
      createdAt: existing?.createdAt ?? data.createdAt ?? now,
      updatedAt: now,
      expiresAt: data.expiresAt,
      selectedDateKeys: Array.from(new Set(data.selectedDateKeys)).sort(),
      selectedTimeSlots: Array.from(new Set(data.selectedTimeSlots)).sort(),
      perDateTime: data.perDateTime
    };
    localStorage.setItem(this.availabilityKey(knitId), JSON.stringify(availability));
    return availability;
  }

  getSelfAvailability(knitId: string): Availability | null {
    const key = this.availabilityKey(knitId);
    const parsed = this.safeParse<Availability>(localStorage.getItem(key));
    if (!parsed) return null;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  }

  private getKnitsMap(): KnitMap {
    return this.safeParse<KnitMap>(localStorage.getItem(this.KNITS_KEY)) ?? {};
  }

  private setKnitsMap(knits: KnitMap): void {
    localStorage.setItem(this.KNITS_KEY, JSON.stringify(knits));
  }

  private getInvitesMap(): InviteMap {
    return this.safeParse<InviteMap>(localStorage.getItem(this.INVITES_KEY)) ?? {};
  }

  private setInvitesMap(invites: InviteMap): void {
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
  }

  private safeParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  private generateId(prefix: string): string {
    const core = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    return `${prefix}_${core}`;
  }
}


