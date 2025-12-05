import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateKnitComponent } from './features/create-knit/create-knit.component';
import { KnitSpaceComponent } from './features/knit-space/knit-space.component';
import { KnitBottomNavComponent } from './shared/knit-bottom-nav/knit-bottom-nav.component';
import { KnitFriendsComponent } from './features/knit-friends/knit-friends.component';
import { KnitEventsComponent } from './features/knit-events/knit-events.component';
import { KnitSettingsComponent } from './features/knit-settings/knit-settings.component';
import { AvailabilitySetupComponent } from './features/availability-setup/availability-setup.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateKnitComponent,
    KnitSpaceComponent,
    KnitBottomNavComponent,
    KnitFriendsComponent,
    KnitEventsComponent,
    KnitSettingsComponent,
    AvailabilitySetupComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
