import { Component, Input } from "@angular/core"
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: "app-stat-card",
  templateUrl: "./stat-card.component.html",
  styleUrls: ["./stat-card.component.scss"],
  imports: [
    MatIcon
  ],
  standalone: true
})
export class StatCardComponent {
  @Input() title = ""
  @Input() value = 0
  @Input() icon = ""
  @Input() color = "#3f51b5"
  @Input() suffix = ""
}

