import {Component, Input, OnInit} from '@angular/core';
import {GraphService} from '../../../services/graph.service';
import {LayoutService} from '../../../services/layout.service';
import {NeEdge} from '../../../models/ne-edge';
import {NeNode} from '../../../models/ne-node';
import {ElementType, UtilityService} from '../../../services/utility.service';

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
   * Type of selected elements
   */
  @Input() elementType: ElementType;
  /**
   * List of selected elements
   */
  @Input() selectedElements: NeNode[] | NeEdge[];
  /**
   * Contains properties relevant for all selected elements
   */
  @Input() relevantProperties: string[];

  /**
   * 'NODE' for selected nodes,
   * 'EDGE' for selected edges.
   * Used as suffix for tooltips.
   */
  type: string;

  /**
   * True, if component is collapsed
   */
  collapsedContainer = false;

  /**
   *
   * @param graphService Service responsible for rendered network
   * @param layoutService Service responsible for tooltip directions
   * @param utilityService Service responsible for util functionality
   */
  constructor(
    public graphService: GraphService,
    public layoutService: LayoutService,
    private utilityService: UtilityService
  ) {
  }

  ngOnInit(): void {
    this.type = this.elementType === this.utilityService.elementType.node ? 'NODE' : 'EDGE';
  }

}
