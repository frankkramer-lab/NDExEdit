import {Component, Input, OnInit} from '@angular/core';
import {ElementType, SidebarMode, UtilityService} from '../../../services/utility.service';
import {NeKeyValue} from '../../../models/ne-key-value';
import {DataService} from '../../../services/data.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {LayoutService} from '../../../services/layout.service';
import {GraphService} from '../../../services/graph.service';
import {
  faCheck,
  faEdit,
  faExclamationTriangle,
  faPlus,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar-edit-property',
  templateUrl: './sidebar-edit-property.component.html',
  styleUrls: ['./sidebar-edit-property.component.scss']
})
export class SidebarEditPropertyComponent implements OnInit {
  /**
   * Type of element
   */
  @Input() elementType: ElementType;
  /**
   * Element specific properties (associated with an ID)
   */
  itemListSpecific: NeKeyValue[] = [];
  /**
   * Element's default properties
   */
  itemListDefault: NeKeyValue[] = [];
  /**
   * Form used for editing element properties
   */
  itemForm: FormGroup;
  /**
   * True, if the form is to be displayed
   */
  editMode = false;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;

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
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;
  /**
   * Icon: faExclamationTriangle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExclamationTriangle = faExclamationTriangle;

  /**
   * Returns the items for the form
   */
  get items(): FormArray {
    return this.itemForm.get('items') as FormArray;
  }

  constructor(
    public dataService: DataService,
    public utilityService: UtilityService,
    public layoutService: LayoutService,
    private graphService: GraphService
  ) {
    dataService.networkChangedEmitter.subscribe((network) => {
      this.initItemList();
    });
  }

  ngOnInit(): void {
    this.initItemList();
  }

  /**
   * Initializes the list of items to display as element properties
   */
  initItemList(): void {
    const baseList = this.dataService.selectedNetwork.mappings;

    if (this.elementType === this.utilityService.elementType.node) {
      this.itemListSpecific = baseList.nodesPropertiesSpecific;
      this.itemListDefault = baseList.nodesPropertiesDefault;
    } else if (this.elementType === this.utilityService.elementType.edge) {
      this.itemListSpecific = baseList.edgesPropertiesSpecific;
      this.itemListDefault = baseList.edgesPropertiesDefault;
    }
  }

  /**
   * Initializes the item form for editing with the given list of items
   */
  initForm(): void {
    const items: FormArray = new FormArray([]);

    for (const item of this.itemListSpecific.concat(this.itemListDefault)) {
      items.push(new FormGroup({
        label: new FormControl(item.name),
        value: new FormControl(item.value),
        appliesTo: new FormControl(item.reference),
        type: new FormControl(item.datatype)
      }));
    }

    this.itemForm = new FormGroup({
      items
    });
  }

  /**
   * Adds a new description item
   */
  addItem(): void {
    (this.itemForm.get('items') as FormArray).push(
      new FormGroup({
        label: new FormControl(null),
        value: new FormControl(null),
        appliesTo: new FormControl(null),
        type: new FormControl(null)
      })
    );
  }

  /**
   * Removes an item at the given index
   * @param index Position to remove
   */
  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  /**
   * Entering or exiting edit mode.
   */
  toggleEditMode(): void {
    if (!this.editMode) {
      this.initForm();
      this.dataService.lockRouting = true;
      this.dataService.setPropertyObjectInEditing(this.utilityService.utilGetPropertyTargetByElementType(this.elementType));
      this.dataService.sidebarMode = SidebarMode.edit;
      this.dataService.storeCxBackup();
      this.editMode = true;
    } else {
      this.dataService.resetObjectInEditing();
      this.itemForm.reset();
      this.dataService.cxBackup = null;
      this.dataService.lockRouting = false;
      this.dataService.sidebarMode = SidebarMode.default;
      this.editMode = false;
    }
  }

  /**
   * Highlights this element briefly.
   * @param elementId This element's ID
   */
  flashElement(elementId: number): void {
    this.graphService.highlightByElementId(String(elementId));
  }

  /**
   * Submitting changes to an element's properties
   */
  onSubmitPropertyChanges(): void {
    const informationSpecific: NeKeyValue[] = [];
    const informationDefault: NeKeyValue[] = [];

    for (const item of this.items.controls) {

      const name = item.get('label').value;
      const value = item.get('value').value;

      if (!name || !value) {
        continue;
      }

      const obj: NeKeyValue = {
        name: item.get('label').value,
        value: item.get('value').value,
        reference: item.get('appliesTo').value,
        datatype: item.get('type').value
      };

      if (obj.reference !== null) {
        informationSpecific.push(obj);
      } else {
        informationDefault.push(obj);
      }
    }

    this.dataService.writeDefaultStyles(this.elementType, informationDefault);
    this.dataService.writeSpecificStyles(this.elementType, informationSpecific);

    this.editMode = false;
    this.dataService.sidebarMode = SidebarMode.default;
    this.dataService.lockRouting = false;
    this.dataService.cxBackup = null;

    this.initForm();
    this.initItemList();

  }
}
