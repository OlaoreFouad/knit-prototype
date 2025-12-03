import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateKnitComponent } from './features/create-knit/create-knit.component';
import { KnitSpaceComponent } from './features/knit-space/knit-space.component';
import { KnitFriendsComponent } from './features/knit-friends/knit-friends.component';
import { KnitEventsComponent } from './features/knit-events/knit-events.component';

const routes: Routes = [
  { path: '', redirectTo: 'create-knit', pathMatch: 'full' },
  { path: 'create-knit', component: CreateKnitComponent },
  { path: 'knit/:id', component: KnitSpaceComponent },
  { path: 'knit/:id/friends', component: KnitFriendsComponent },
  { path: 'knit/:id/events', component: KnitEventsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
