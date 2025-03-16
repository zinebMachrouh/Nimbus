import { Component, Input } from "@angular/core"
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {MatButton} from "@angular/material/button";

@Component({
  selector: "app-trip-card",
  templateUrl: "./trip-card.component.html",
  styleUrls: ["./trip-card.component.scss"],
  imports: [
    MatIcon,
    NgClass,
    DatePipe,
    RouterLink,
    MatButton,
    NgIf
  ],
  standalone: true
})
export class TripCardComponent {
  @Input() trip: any
  @Input() showActions = false
}

