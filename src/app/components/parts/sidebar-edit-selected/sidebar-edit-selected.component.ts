import {Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {GraphService} from '../../../services/graph.service';
import {LayoutService} from '../../../services/layout.service';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {NeEdge} from '../../../models/ne-edge';
import {NeNode} from '../../../models/ne-node';
import {NeElement} from '../../../models/ne-element';

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
   * 'NODE' for selected nodes,
   * 'EDGE' for selected edges.
   * Used as suffix for tooltips.
   */
  @Input() type: string;
  /**
   * List of selected elements
   */
  @Input() selectedElements: NeNode[] | NeEdge[];
  /**
   * Contains properties relevant for all selected elements
   */
  @Input() relevantProperties: string[];

  /**
   * True, if component is collapsed
   */
  isCollapsedSelection = false;

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
