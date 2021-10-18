import {Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {faArrowLeft, faRedo} from '@fortawesome/free-solid-svg-icons';
import {GraphService} from '../../services/graph.service';
import {LayoutService} from '../../services/layout.service';

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
   * Icon: faRedo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faRedo = faRedo;
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
    'JPEG',
    'CX'
  ];
  /**
   * Selected file type
   */
  selectedFileType = 'CX';
  /**
   * False, if only the viewport is to be exported
   */
  optFull = false;
  /**
   * Positive number indicating scaling of the resulting image, should not be higher than 10 due to performance concerns
   */
  optScale = 1;
  /**
   * Color of the background in hexadecimal format, e.g. '#ff0000',
   * should by default be the network's background color
   */
  optBg = '#fff';
  /**
   * True, if the background set by {@link optBg} is to be used.
   */
  optUseBg = true;
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

  /**
   * Constructor
   * @param dataService service responsible for data access
   * @param graphService service responsible for graph manipulations
   * @param layoutService service responsible for tooltip directions
   */
  constructor(
    public dataService: DataService,
    public graphService: GraphService,
    public layoutService: LayoutService
  ) {
  }

  ngOnInit(): void {
    if (this.dataService.selectedNetwork) {
      this.optBg = this.dataService.getBackgroundColor();
    }
  }

  /**
   * Calls type specific download methods based on {@link SidebarImageComponent#selectedFileType}
   */
  downloadImage(): void {
    switch (this.selectedFileType) {
      case 'PNG':
        this.downloadImagePNG();
        break;
      case 'JPEG':
        this.downloadImageJPEG();
        break;
      case 'CX':
        this.downloadCx();
        break;
    }
  }

  /**
   * Prepares the URL to download the PNG image
   */
  downloadImagePNG(): void {
    this.url = window.URL.createObjectURL(this.dataService.selectedNetwork.core.png({
      output: 'blob',
      full: this.optFull ?? false,
      bg: this.optUseBg ? this.optBg : null,
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
      bg: this.optUseBg ? this.optBg : null,
      scale: this.optScale,
      maxHeight: this.optHeight ?? null,
      maxWidth: this.optWidth ?? null
    }));

    this.download('.jpeg');
  }

  /**
   * Selects the specified file type
   * @param option
   */
  selectImageType(option: string): void {
    this.selectedFileType = option;
  }

  /**
   * Download the network as CX file
   */
  downloadCx(): void {
    this.dataService.removeNdexStatus();
    const network = this.dataService.selectedNetwork;
    let filename;
    if (!!network.networkInformation.name) {
      filename = network.networkInformation.name;
    } else if (!!network.networkInformation.uuid) {
      filename = network.networkInformation.uuid;
    } else {
      filename = 'ndex_edit_network_' + this.dataService.networksParsed.indexOf(this.dataService.selectedNetwork).toString();
    }

    const blob = new Blob([JSON.stringify(network.cx)], {type: 'application/octet-stream'});
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename + '.cx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Downloads the generated image
   * @param file url to download the generated image
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
}
