import {Component, OnInit} from '@angular/core';
import {GraphService} from '../../../services/graph.service';
import {LayoutService} from '../../../services/layout.service';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar-edit-selected',
  templateUrl: './sidebar-edit-selected.component.html',
  styleUrls: ['./sidebar-edit-selected.component.scss']
})
/**
 * Component responsible for rendering an overview over selected elements
 */
export class SidebarEditSelectedComponent implements OnInit {
  /**
   * Icon: faChevronDown
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronDown = faChevronDown;

  /**
   *
   * @param graphService Service responsible for rendered network
   * @param layoutService Service responsible for tooltip directions
   */
  constructor(
    public graphService: GraphService,
    public layoutService: LayoutService
  ) {
  }

  ngOnInit(): void {
  }

}
