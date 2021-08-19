import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LayoutService} from '../../services/layout.service';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faExchangeAlt,
  faRedo
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dragbar',
  templateUrl: './dragbar.component.html',
  styleUrls: ['./dragbar.component.scss']
})
export class DragbarComponent implements OnInit {
  faAngleDoubleLeft = faAngleDoubleLeft;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faAngleDoubleRight = faAngleDoubleRight;
  faRedo = faRedo;
  faExchangeAlt = faExchangeAlt;

  @Output() languageEmitter = new EventEmitter<string>();

  constructor(public layoutService: LayoutService) {
  }

  ngOnInit(): void {
  }

  setLanguage(lang: string): void {
    this.languageEmitter.emit(lang);
  }
}
