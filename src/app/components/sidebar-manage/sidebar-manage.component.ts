import {Component} from '@angular/core';
import {
  faClone,
  faCloudDownloadAlt,
  faFileDownload,
  faFileExport,
  faImage,
  faInfo,
  faPaintBrush,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UtilityService} from '../../services/utility.service';
import {ParseService} from '../../services/parse.service';

@Component({
  selector: 'app-sidebar-manage',
  templateUrl: './sidebar-manage.component.html',
  styleUrls: ['./sidebar-manage.component.scss']
})

/**
 * Component responsible for graph selection and file management
 */
export class SidebarManageComponent {

  constructor(
    public dataService: DataService,
    private http: HttpClient,
    private utilityService: UtilityService,
    private parseService: ParseService,
  ) {
  }

  /**
   * Icon: faImage
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faImage = faImage;
  /**
   * Icon: faCloudDownloadAlt
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCloudDownloadAlt = faCloudDownloadAlt;
  /**
   * Icon: faClone
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faClone = faClone;
  /**
   * Icon: faPaintBrush
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPaintBrush = faPaintBrush;
  /**
   * Icon: faInfo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faInfo = faInfo;
  /**
   * Icon: faFileDownload
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileDownload = faFileDownload;
  /**
   * Icon: faSave
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSave = faSave;
  /**
   * Icon: faFileExport
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileExport = faFileExport;
  /**
   * File from local computer to import
   */
  fileToUpload: File = null;
  /**
   * Link to NDEx network which is to be loaded
   */
  ndexLinkToUpload: string = null;
  /**
   * Boolean to disaply the file-is-too-large-alert
   */
  showFileSizeTooLargeAlert = false;
  /**
   * Boolean to display the file-size-ok-alert
   */
  showFileSizeOkAlert = false;
  /**
   * Boolean to display the file-extension-invalid-alert
   */
  showFileNotValidAlert = false;
  /**
   * Boolean to display the element-count-too-big-alert
   */
  showFileElementCountTooBig = false;
  /**
   * Boolean indicating if data is currently being loaded via HTTP
   */
  loadingHttp = false;
  /**
   * Boolean indicating if data is currently being loaded from a file
   */
  loadingFile = false;
  /**
   * Number of nodes
   */
  nodeCount = 0;
  /**
   * Number of edges
   */
  edgeCount = 0;
  /**
   * Limit of elements for each nodes or edges
   */
  elementLimit = 30000;
  /**
   * File size limit in MB
   */
  sizeLimit = 20;
  /**
   * Current file size
   */
  currentFileSize: number;
  /**
   * Current file extension
   */
  invalidExtension: string;
  /**
   * Factor to display bytes as megabytes
   *
   * @private
   */
  private readonly megaFactor = 1000000;
  /**
   * Options required for HTTP requests to public NDEx API
   *
   * @private
   */
  private readonly options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  /**
   * NDEx's public API endpoint
   * @private
   */
  private readonly ndexPublicApiHost = 'http://public.ndexbio.org/v2/';

  /**
   * Tooltip for copying a UUID to clipboard
   */
  copyToClipboardTooltip = 'SIDEBAR_MANAGE_TT_CLIPBOARD';

  /**
   * Converts a network to .cx file format
   *
   * @param id network's id
   */
  downloadNetwork(id: number): void {
    const network = this.dataService.getNetworkById(id);

    const blob = new Blob([JSON.stringify(network.cx)], {type: 'application/octet-stream'});
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', (network.networkInformation.name || 'network_' + id) + '.cx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Adds a selected file from the local harddrive to the application, triggers its conversion and makes it displayable.
   */
  importLocalFile(): void {
    if (!this.fileToUpload) {
      this.loadingFile = false;
      return;
    }
    this.loadingFile = true;
    this.fileToUpload.text()
      .then(data => {
        this.dataService.networksDownloaded.push(JSON.parse(data));
        this.parseService.convert(
          null,
          JSON.parse(data),
          UtilityService.utilCleanString(this.fileToUpload.name),
          null, // assuming a local file has no UUID
          this.dataService.nextId())
          .then(convertedNetwork => {
            this.dataService.networksParsed.push(convertedNetwork);
          })
          .catch(e => {
            console.log(e);
          })
          .finally(() => this.loadingFile = false);

      })
      .catch(error => console.error(error));
  }

  /**
   * Imports data from NDEx. Works with link to publicly accessible network or just its ID
   */
  importFromNdex(): void {
    if (!this.ndexLinkToUpload) {
      this.loadingHttp = false;
      return;
    }
    this.loadingHttp = true;
    const slashSplit = this.ndexLinkToUpload.split('/');
    const uuid = slashSplit[slashSplit.length - 1];

    this.http.get(this.ndexPublicApiHost + 'network/' + slashSplit[slashSplit.length - 1] + '/summary', this.options)
      .toPromise()
      .then((preview: any) => {
        if ((preview.nodeCount && preview.nodeCount > this.elementLimit) || (preview.edgeCount && preview.edgeCount > this.elementLimit)) {
          this.nodeCount = preview.nodeCount;
          this.edgeCount = preview.edgeCount;
          this.showFileElementCountTooBig = true;
          this.showFileSizeTooLargeAlert = false;
          this.showFileNotValidAlert = false;
          this.showFileSizeOkAlert = false;
          this.loadingHttp = false;

          setTimeout(() => {
            this.showFileElementCountTooBig = false;
          }, 8000);

          return;
        }
        this.http.get(this.ndexPublicApiHost + 'network/' + uuid, this.options)
          .toPromise()
          .then((data: any[]) => {

            if (!data) {
              return;
            }

            const dataSize = new TextEncoder().encode(JSON.stringify(data)).length;
            this.currentFileSize = Number((dataSize / this.megaFactor).toFixed(2));

            if (this.currentFileSize > this.sizeLimit) {
              this.showFileSizeTooLargeAlert = true;
              this.showFileElementCountTooBig = false;
              this.showFileNotValidAlert = false;
              this.showFileSizeOkAlert = false;
              this.loadingHttp = false;

              setTimeout(() => {
                this.showFileSizeTooLargeAlert = false;
              }, 8000);

              return;
            } else {
              this.showFileSizeOkAlert = true;
              this.showFileElementCountTooBig = false;
              this.showFileSizeTooLargeAlert = false;
              this.showFileNotValidAlert = false;
              this.loadingHttp = false;

              setTimeout(() => {
                this.showFileSizeOkAlert = false;
              }, 8000);
            }

            let networkName = String(this.dataService.networksDownloaded.length);
            for (const d of data) {
              if (d.networkAttributes) {
                for (const prop of d.networkAttributes) {
                  if (d.n === 'name') {
                    networkName = d.networkAttributes.name;
                  }
                }
              }
            }
            this.dataService.networksDownloaded.push(data);
            this.parseService.convert(
              null,
              data,
              UtilityService.utilCleanString(networkName),
              uuid ?? null,
              this.dataService.nextId())
              .then(convertedNetwork => {
                this.dataService.networksParsed.push(convertedNetwork);
              })
              .catch(e => console.error(e))
              .finally(() => this.loadingHttp = false);

          })
          .catch(error => console.error(error));

      })
      .catch(error => console.error(error));
  }

  /**
   * Sets file to be uploaded from local directory. If an error with the file exists, it displays alerts.
   * Validations include correct file extension (.cx) and size limit of 20 MB.
   *
   * @param event ChangeEvent is triggered on selection of a local file or the aborted selection
   */
  setAndValidateFile(event: Event): void {

    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      this.fileToUpload = target.files[0];
    } else {
      return;
    }

    const pointSplit = this.fileToUpload.name.split('.');
    const fileExtension = pointSplit[pointSplit.length - 1];
    this.currentFileSize = Number((this.fileToUpload.size / this.megaFactor).toFixed(2));

    // current file limit is set to 20MB, which has proven to overload the application
    if (this.fileToUpload.size > (this.sizeLimit * this.megaFactor)) {
      this.showFileSizeTooLargeAlert = true;
      this.showFileElementCountTooBig = false;
      this.showFileSizeOkAlert = false;
      this.showFileNotValidAlert = false;
      this.fileToUpload = null;

      setTimeout(() => {
        this.showFileSizeTooLargeAlert = false;
      }, 8000);

    } else if (fileExtension !== 'cx') {

      this.invalidExtension = fileExtension;
      this.showFileNotValidAlert = true;
      this.showFileElementCountTooBig = false;
      this.showFileSizeOkAlert = false;
      this.showFileSizeTooLargeAlert = false;
      this.fileToUpload = null;

      setTimeout(() => {
        this.showFileNotValidAlert = false;
      }, 8000);

    } else {

      this.showFileSizeOkAlert = true;
      this.showFileElementCountTooBig = false;
      this.showFileSizeTooLargeAlert = false;
      this.showFileNotValidAlert = false;

      setTimeout(() => {
        this.showFileSizeOkAlert = false;
      }, 8000);
    }
  }

  /**
   * Copies this network's UUID to the clipboard
   */
  copyUuidToClipboard(networkId: number): void {
    const network = this.dataService.networksParsed.find(x => x.id === networkId);
    if (network.networkInformation.uuid) {
      navigator.clipboard.writeText(network.networkInformation.uuid);
      this.copyToClipboardTooltip = 'SIDEBAR_MANAGE_CLIPBOARD_SUCCESSFUL';
      window.setTimeout(() => {
        this.copyToClipboardTooltip = 'SIDEBAR_MANAGE_TT_CLIPBOARD';
      }, 5000);
    }
  }
}
