import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { KnitStateService } from '../../services/knit-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-knit',
  templateUrl: './create-knit.component.html',
  styleUrls: ['./create-knit.component.scss']
})
export class CreateKnitComponent {
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly knitState: KnitStateService,
    private readonly router: Router
  ) {}

  createdInviteUrl: string | null = null;

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: [''],
    friendCountRange: ['2-4', [Validators.required]],
    securityQuestion: [''],
    securityAnswer: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description, friendCountRange, securityQuestion, securityAnswer } = this.form.value;
    const result = this.knitState.createKnit({
      name: name ?? '',
      description: description ?? undefined
    });
    // augment with friend count and security
    const knit = { ...result.knit, friendCountRange: (friendCountRange as any) ?? '2-4' };
    if (securityQuestion && securityAnswer) {
      knit.securityQuestion = securityQuestion ?? undefined;
      knit.securityAnswer = securityAnswer ?? undefined;
    }
    this.knitState.updateKnit(knit);
    this.createdInviteUrl = result.inviteUrl;
    this.router.navigate(['/knit', knit.id]);
  }

  copyInvite(): void {
    if (!this.createdInviteUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.createdInviteUrl);
    }
  }
}


