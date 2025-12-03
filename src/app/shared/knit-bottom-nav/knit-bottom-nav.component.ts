import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-knit-bottom-nav',
  templateUrl: './knit-bottom-nav.component.html',
  styleUrls: ['./knit-bottom-nav.component.scss']
})
export class KnitBottomNavComponent {
  @Input() knitId!: string;
}


