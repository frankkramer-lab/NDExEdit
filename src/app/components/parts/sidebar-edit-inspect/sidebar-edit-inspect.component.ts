import {Component, OnInit} from '@angular/core';
import {NeHighlightForm} from '../../../models/ne-highlight-form';
import {UtilityService} from '../../../services/utility.service';
import {NeAspect} from '../../../models/ne-aspect';
import {GraphService} from '../../../services/graph.service';
import {faTrash, faTimes, faMagic, faCheck} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-sidebar-edit-inspect',
  templateUrl: './sidebar-edit-inspect.component.html',
  styleUrls: ['./sidebar-edit-inspect.component.scss']
})
export class SidebarEditInspectComponent implements OnInit {
  /**
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
  /**
   * List of user defined inspections,
   * e.g. 'Highlight all nodes, where 'Bait_boolean' = 1'
   */
  highlightListDefinition: NeHighlightForm[] = [];
  /**
   * 'numeric' or 'text', where 'numeric' indicates that a property should be selected based on min and max thresholds.
   * 'text' indicates, that a discrete value for the chosen property is needed.
   * Integer based properties should be treated as numeric.
   */
  highlightDefinitionDatatype: string;
  /**
   * Currently user defined inspection
   */
  highlightDefinition: NeHighlightForm = {
    property: null,
    type: null,
    typeLabel: null,
    markedForDeletion: false,
    sameAs: null,
    rangeLower: null,
    rangeUpper: null
  };

  constructor(
    public utilityService: UtilityService,
    public graphService: GraphService,
    private dataService: DataService
  ) {
  }

  ngOnInit(): void {
  }


  /**
   * Adds the property to the highlight definition the user is currently defining
   * @param property
   */
  selectProperty(property: NeAspect): void {
    this.highlightDefinition.property = property;

    if (this.utilityService.utilFitForContinuous(property)) {
      this.highlightDefinitionDatatype = 'numeric';
      this.highlightDefinition.rangeLower = property.min;
      this.highlightDefinition.rangeUpper = property.max;
    } else {
      this.highlightDefinitionDatatype = 'text';
    }
  }

  /**
   * Sets the type of the current inspection
   * @param type
   */
  selectType(type: string): void {
    this.highlightDefinitionDatatype = null;
    this.highlightDefinition.type = type;
    this.highlightDefinition.typeLabel = (type === 'node') ? 'SIDEBAR_EDIT_INSPECT_TYPE_NODE' : 'SIDEBAR_EDIT_INSPECT_TYPE_EDGE';
  }


  /**
   * Submits a definition to the list of definitions the user wants to highlight
   */
  addHighlightDefinitionToList(): void {

    if (this.highlightDefinitionDatatype === 'numeric') {
      this.highlightDefinition.rangeLower = Number(this.highlightDefinition.rangeLower);
      this.highlightDefinition.rangeUpper = Number(this.highlightDefinition.rangeUpper);
    }

    this.highlightListDefinition.push(this.highlightDefinition);

    this.highlightDefinition = {
      property: null,
      type: null,
      typeLabel: null,
      markedForDeletion: false,
      sameAs: null,
      rangeLower: null,
      rangeUpper: null
    };
    this.highlightDefinitionDatatype = null;
  }


  /**
   * Marks an inspection from the list as to be deleted
   * @param index Points to the specified element
   */
  markForDeletion(index: number): void {
    this.highlightListDefinition[index].markedForDeletion = true;
  }

  /**
   * Removes the mark to be deleted from the inspection
   * @param index Points to the specified element
   */
  unmarkForDeletion(index: number): void {
    this.highlightListDefinition[index].markedForDeletion = false;
  }

  /**
   * Removes the element from the list of inspections
   * @param index Points to the specified element
   */
  deleteFromHighlightList(index: number): void {
    this.highlightListDefinition.splice(index, 1);
  }

  /**
   * Returns attributes related to nodes or edges
   * @param type
   */
  getAvailablePropertiesByType(type: string): NeAspect[] {
    if (type === 'node') {
      return this.dataService.getSelectedNetwork().aspectKeyValuesNodes;
    }
    return this.dataService.getSelectedNetwork().aspectKeyValuesEdges;
  }
}
