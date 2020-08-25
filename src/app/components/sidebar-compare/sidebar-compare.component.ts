import { Component, OnInit } from '@angular/core';
import {faCalendar, faGrinStars, faRoad, faThumbsUp, faUserGraduate, faComments, faTools, faToolbox} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar-compare',
  templateUrl: './sidebar-compare.component.html',
  styleUrls: ['./sidebar-compare.component.scss']
})

/**
 * Component responsible for graph comparison
 */
export class SidebarCompareComponent implements OnInit {

  faCalendar = faCalendar;
  faGrinStars = faGrinStars;
  faRoad = faRoad;
  faThumbsUp = faThumbsUp;
  faUserGraduate = faUserGraduate;
  faComments = faComments;
  faTools = faTools;
  faToolbox = faToolbox;

  constructor() { }

  ngOnInit(): void {
  }

}
