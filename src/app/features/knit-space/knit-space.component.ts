import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnitStateService } from '../../services/knit-state.service';
import { Knit } from '../../models/knit';
import { Invite } from '../../models/invite';

type InviteEmailState = 'not_sent' | 'pending' | 'sent' | 'failed';
interface InviteEmail {
  email: string;
  state: InviteEmailState;
  updatedAt: number;
}

@Component({
  selector: 'app-knit-space',
  templateUrl: './knit-space.component.html',
  styleUrls: ['./knit-space.component.scss'],
})
export class KnitSpaceComponent implements OnInit {
  knit: Knit | null = null;
  invite: Invite | null = null;
  inviteUrl: string = '';

  emailsText = '';
  inviteEmails: InviteEmail[] = [];
  isInviteOpen = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly knitState: KnitStateService
  ) {}

  ngOnInit(): void {
    const knitId = this.route.snapshot.paramMap.get('id')!;
    this.knit = this.knitState.getKnitById(knitId);
    if (this.knit) {
      this.invite = this.knitState.getInviteByKnitId(this.knit.id);
      if (this.invite) {
        this.inviteUrl =
          (window?.location?.origin ?? '') + '/invite/' + this.invite.id;
      }
      this.inviteEmails = this.getStoredInviteEmails();
    }
  }

  private getStoredInviteEmails(): InviteEmail[] {
    const key = this.emailStoreKey();
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as InviteEmail[]) : [];
    } catch {
      return [];
    }
  }

  private setStoredInviteEmails(list: InviteEmail[]): void {
    localStorage.setItem(this.emailStoreKey(), JSON.stringify(list));
  }

  private emailStoreKey(): string {
    return this.knit
      ? `knit:inviteEmails:${this.knit.id}`
      : 'knit:inviteEmails';
  }

  parseEmails(): void {
    const emails = this.emailsText
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean)
      .filter((e) => this.isValidEmail(e));
    const existing = new Set(
      this.inviteEmails.map((i) => i.email.toLowerCase())
    );
    const now = Date.now();
    const toAdd: InviteEmail[] = emails
      .filter((e) => !existing.has(e.toLowerCase()))
      .map((email) => ({ email, state: 'not_sent', updatedAt: now }));
    this.inviteEmails = [...this.inviteEmails, ...toAdd];
    this.setStoredInviteEmails(this.inviteEmails);
    this.emailsText = '';
  }

  sendInvites(): void {
    // Prototype: simulate async send with quick status update
    this.inviteEmails = this.inviteEmails.map((i) =>
      i.state === 'not_sent'
        ? { ...i, state: 'pending', updatedAt: Date.now() }
        : i
    );
    this.setStoredInviteEmails(this.inviteEmails);
    setTimeout(() => {
      const updated = this.inviteEmails.map((i) => {
        if (i.state !== 'pending') return i;
        const success = Math.random() > 0.1; // 90% success rate
        return {
          ...i,
          state: <InviteEmailState>(success ? 'sent' : 'failed'),
          updatedAt: Date.now(),
        };
      });
      this.inviteEmails = updated;
      this.setStoredInviteEmails(this.inviteEmails);
    }, 800);
  }

  shareWhatsApp(): void {
    if (!this.inviteUrl) return;
    const text = `Join our Knit "${this.knit?.name}": ${this.inviteUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  shareInstagram(): void {
    if (!this.inviteUrl) return;
    const shareData = {
      title: this.knit?.name ?? 'Join our Knit',
      text: `Join our Knit "${this.knit?.name}"`,
      url: this.inviteUrl,
    };
    if ((navigator as any).share) {
      (navigator as any).share(shareData);
    } else {
      // Fallback: copy link
      this.copyLink();
    }
  }

  copyLink(): void {
    if (!this.inviteUrl) return;
    navigator.clipboard?.writeText(this.inviteUrl);
  }

  get qrSrc(): string {
    return this.inviteUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          this.inviteUrl
        )}`
      : '';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
