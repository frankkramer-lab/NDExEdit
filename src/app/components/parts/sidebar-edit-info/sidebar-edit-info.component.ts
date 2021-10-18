import {Component, Input, OnInit} from '@angular/core';
import {LayoutService} from '../../../services/layout.service';
import {DataService} from '../../../services/data.service';
import {NeKeyValue} from '../../../models/ne-key-value';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {faCheck, faEdit, faExclamationTriangle, faPlus, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';
import {ElementType, UtilityService} from '../../../services/utility.service';

@Component({
  selector: 'app-sidebar-edit-info',
  templateUrl: './sidebar-edit-info.component.html',
  styleUrls: ['./sidebar-edit-info.component.scss']
})
export class SidebarEditInfoComponent implements OnInit {

  /**
   * Headline for this list of editable items
   */
  @Input() headline: string;

  /**
   * Either 'information', 'NODES_DEFAULT' or 'EDGES_DEFAULT'
   */
  @Input() target: string;

  /**
   * List of items to be displayed and edited
   */
  @Input() itemList: NeKeyValue[];

  /**
   * Only necessary for the default node or edge properties
   */
  @Input() elementType: ElementType = null;

  /**
   * True, if the user is modifying the list via form
   */
  editMode = false;

  /**
   * Form for editing the list
   */
  itemForm: FormGroup;
  /**
   * Icon: faTimes
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTimes = faTimes;
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
   * Icon: faCheck
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCheck = faCheck;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faTrash
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faTrash = faTrash;

  constructor(
    public layoutService: LayoutService,
    public dataService: DataService,
    private utilityService: UtilityService
  ) {
  }

  /**
   * Returns the items for the form
   */
  get items(): FormArray {
    return this.itemForm.get('items') as FormArray;
  }

  ngOnInit(): void {
  }


  /**
   * Initializes the item form for editing with the given list of items
   */
  initForm(): void {
    const items: FormArray = new FormArray([]);

    for (const item of this.itemList) {
      items.push(new FormGroup({
        label: new FormControl(item.name),
        value: new FormControl(item.value),
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
   * Submitting the form will apply the changes to either information or status object within the network information.
   * Target is defined by {@link target}
   */
  onSubmitDescriptionChanges(): void {
    const information: NeKeyValue[] = [];
    for (const item of this.items.controls) {

      const name = item.get('label').value;
      const value = item.get('value').value;

      if (!name || !value) {
        continue;
      }

      const obj: NeKeyValue = {
        name: item.get('label').value,
        value: item.get('value').value,
        datatype: item.get('type').value
      };
      information.push(obj);
    }
    if (this.target === 'information') {
      this.dataService.writeNetworkInformation(information);
    } else if (this.target.endsWith('DEFAULT')) {
      this.dataService.writeDefaultStyles(this.elementType, information);
    } else if (this.target === 'network') {
      this.dataService.writeNetworkStyles(information);
    } else {
      console.log('Undefined action! Target unknown: ' + this.target);
    }
    this.editMode = false;
    this.dataService.lockRouting = false;

    this.initForm();
  }

  /**
   * Switches edit mode on or off
   */
  toggleEditMode(): void {
    if (!this.editMode) {
      this.initForm();
      this.dataService.lockRouting = true;

      this.dataService.objInEditing = {
        elementType: this.elementType,
        mappingType: null,
        nwInfo: this.target === 'information',
        nwVisuals: this.target !== 'information'
      };

      this.editMode = true;
    } else {
      this.itemForm.reset();
      this.dataService.lockRouting = false;

      this.dataService.objInEditing = {
        elementType: null,
        mappingType: null,
        nwInfo: false,
        nwVisuals: false
      };

      this.editMode = false;
    }
  }

  /**
   * Removes all network styles
   */
  removeAll(): void {
    this.itemForm = new FormGroup({
      items: new FormArray([])
    });
  }
}
