import {Component} from '@angular/core';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faChevronDown,
  faChevronRight,
  faComments,
  faExchangeAlt,
  faRedo,
  faThumbsUp,
  faUserGraduate,
  faUser,
  faHome,
  faEdit,
  faMagic,
  faGlobe,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {LayoutService} from '../../services/layout.service';

@Component({
  selector: 'app-main-info',
  templateUrl: './main-info.component.html',
  styleUrls: ['./main-info.component.scss']
})

/**
 * Component responsible for FAQ display
 */
export class MainInfoComponent {
  /**
   * Icon: faAngleRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleRight = faAngleRight;
  /**
   * Icon: faUser
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUser = faUser;
  /**
   * Icon: faHome
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faHome = faHome;
  /**
   * Icon: faEdit
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faEdit = faEdit;
  /**
   * Icon: faMagic
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMagic = faMagic;
  /**
   * Icon: faGlobe
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faGlobe = faGlobe;
  /**
   * Icon: faExclamationTriangle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExclamationTriangle = faExclamationTriangle;
  /**
   * Icon: faChevronDown
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronDown = faChevronDown;
  /**
   * Icon: faChevronRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faChevronRight = faChevronRight;
  /**
   * Icon: faAngleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleLeft = faAngleLeft;
  /**
   * Icon: faAngleDoubleRight
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleDoubleRight = faAngleDoubleRight;
  /**
   * Icon: faAngleDoubleLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faAngleDoubleLeft = faAngleDoubleLeft;
  /**
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
  /**
   * Icon: faExchangeAlt
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExchangeAlt = faExchangeAlt;
  /**
   * Icon: faThumbsUp
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faThumbsUp = faThumbsUp;

  /**
   * Icon: faUserGraduate
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUserGraduate = faUserGraduate;

  /**
   * Icon: faComments
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faComments = faComments;

  /**
   * List of subcomponent's state.
   * True, if a component is expanded
   */
  partsExpanded = {
    intro: false,
    app: false,
    ndex: false,
    mappings: false,
    start: false,
    import: false,
    inspect: false,
    edit: false,
    export: false,
    icons: false,
    faq: false
  };

  /**
   * Possible layouts displayed with image
   */
  readonly layoutPreviews = [
    'circular',
    'concentric',
    'force-driven',
    'grid',
    'hierarchical',
    'random'
  ];
  /**
   *
   * @param dataService Service responsible for data access
   * @param layoutService Service responsible for tooltip directions
   */
  constructor(
    public dataService: DataService,
    public layoutService: LayoutService
  ) {
  }

  /**
   * Switches the subcomponent's state from expanded to collapsed
   * or vice versa.
   * @param key Name of this subcomponent
   */
  expandPart(key: string): void {
    this.partsExpanded[key] = !this.partsExpanded[key];
  }

}
