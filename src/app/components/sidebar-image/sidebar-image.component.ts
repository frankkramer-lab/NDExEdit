import {Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {GraphService} from '../../services/graph.service';

@Component({
  selector: 'app-sidebar-image',
  templateUrl: './sidebar-image.component.html',
  styleUrls: ['./sidebar-image.component.scss']
})
/**
 * Component to export the specified network as PNG or JPEG
 */
export class SidebarImageComponent implements OnInit {
  /**
   * Constructor
   * @param dataService service responsible for data access
   * @param graphService servie responsible for graph manipulations
   */
  constructor(
    public dataService: DataService,
    private graphService: GraphService
  ) {
  }

  /**
   * Icon: faArrowLeft
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faArrowLeft = faArrowLeft;

  /**
   * Possible file types
   */
  fileTypeOptions: string[] = [
    'PNG',
    'JPEG'
  ];
  /**
   * Selected file type
   */
  selectedFileType: string;
  /**
   * False, if only the viewport is to be exported
   */
  optFull = false;
  /**
   * Positive number indicating scaling of the resulting image, should not be higher than 10 due to performance concerns
   */
  optScale = 1;
  /**
   * Color of the background
   */
  optBg: string;
  /**
   * Optional height value of the resulting image
   */
  optHeight: number;
  /**
   * Optional width value of the resulting image
   */
  optWidth: number;

  /**
   * Generated URL to download the image
   */
  url: string;

  ngOnInit(): void {
  }

  /**
   * Prepares the URL to download the PNG image
   */
  downloadImagePNG(): void {
    this.url = window.URL.createObjectURL(this.dataService.selectedNetwork.core.png({
      output: 'blob',
      full: this.optFull ?? false,
      bg: this.optBg ?? null,
      scale: this.optScale,
      maxHeight: this.optHeight ?? null,
      maxWidth: this.optWidth ?? null
    }));

    this.download('.png');
  }

  /**
   * Prepares the URL to download the JPEG image
   */
  downloadImageJPEG(): void {
    this.url = window.URL.createObjectURL(this.dataService.selectedNetwork.core.jpeg({
      output: 'blob',
      full: this.optFull ?? false,
      bg: this.optBg ?? null,
      scale: this.optScale,
      maxHeight: this.optHeight ?? null,
      maxWidth: this.optWidth ?? null
    }));

    this.download('.jpeg');
  }

  /**
   * Downloads the generated image
   * @param file
   * @private
   */
  private download(file: string): void {
    const a = document.createElement('a');
    a.href = this.url;
    a.setAttribute('download', (this.dataService.selectedNetwork.networkInformation.name || 'network_image') + file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Selects the specified file type
   * @param option
   */
  selectImageType(option: string): void {
    this.selectedFileType = option;
  }

  /**
   * Toggles labels by using a specific CSS class which overrides the values of the labels
   * @param show Determines if labels are to be displayed
   */
  toggleLabels(show: boolean): void {
    this.graphService.toggleLabels(show);
    this.dataService.getSelectedNetwork().showLabels = show;
  }
}
