import {Component, OnInit} from '@angular/core';
import {
  faCheck,
  faCloudDownloadAlt,
  faFileDownload,
  faFileUpload,
  faHome,
  faInfo,
  faPaintBrush,
  faPaste,
  faSearch,
  faTimes,
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {HttpClient} from '@angular/common/http';
import {UtilityService, Visibility} from '../../services/utility.service';
import {ParseService} from '../../services/parse.service';
import {LayoutService} from '../../services/layout.service';
import {Observable} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {NeSearchResultNetwork} from '../../models/ne-search-result-network';
import {NeSearchResultItem} from '../../models/ne-search-result-item';

@Component({
  selector: 'app-sidebar-manage',
  templateUrl: './sidebar-manage.component.html',
  styleUrls: ['./sidebar-manage.component.scss']
})

/**
 * Component responsible for graph selection and file management
 */
export class SidebarManageComponent implements OnInit {
  /**
   * Icon: faInfo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faInfo = faInfo;
  /**
   * Icon: faUser
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUser = faUser;
  /**
   * Icon: faUsers
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUsers = faUsers;
  /**
   * Icon: faCloudDownloadAlt
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faCloudDownloadAlt = faCloudDownloadAlt;
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
   * Icon: faPaintBrush
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPaintBrush = faPaintBrush;
  /**
   * Icon: faFileDownload
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileDownload = faFileDownload;
  /**
   * Icon: faFileUpload
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileUpload = faFileUpload;
  /**
   * Icon: faSearch
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faSearch = faSearch;
  /**
   * Icon: faHome
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faHome = faHome;
  /**
   * Icon: faPaste
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPaste = faPaste;
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
   * Boolean to display the invalid-file-alert
   */
  showInvalidFile = false;
  /**
   * Boolean to display the empty-search-term-alert
   */
  showEmptySearchTerm = false;
  /**
   * Boolean to display if the request returned an empty set
   */
  showEmptyBrowseResult = false;
  /**
   * Boolean to display if the user wants to browse private networks, but is still offline.
   */
  showUserOfflineWantsPrivate = false;
  /**
   * Boolean indicating if data is currently being loaded via HTTP
   */
  loadingFetch = false;
  /**
   * Boolean indicating that a search request is in progress via HTTP
   */
  loadingSearch = false;
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
   * When browsing the NDEx database, we need a searchstring
   */
  searchTerm = '';
  /**
   * Result when browsing NDEx
   */
  // searchResult: NeSearchResultItem[] = null;
  /**
   * Index of the network for which the description is displayed
   */
  displaySearchNetworkPreview = -1;

  /**
   * Id for a browsed network that is currently being downloaded.
   * Used to replace this item's button with a spinner.
   */
  downloadByBrowseResultId = -1;

  /**
   * Visibility mode for searching on NDEx
   */
  searchVisibility: Visibility = Visibility.public;

  /**
   * Factor to display bytes as megabytes
   *
   * @private
   */
  private readonly megaFactor = 1000000;

  /**
   *
   * @param dataService Service responsible for data access
   * @param http Needed to load data from ndex
   * @param utilityService Service responsible for shared code
   * @param parseService Service responsible for parsing a network
   * @param layoutService Service responsible for tooltip directions
   * @param authService Service responsible for authentication and HTTP
   */
  constructor(
    public dataService: DataService,
    private http: HttpClient,
    public utilityService: UtilityService,
    private parseService: ParseService,
    public layoutService: LayoutService,
    public authService: AuthService
  ) {
  }

  /**
   * Resets the selected network to null
   */
  ngOnInit(): void {
    this.dataService.selectedNetwork = null;
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
  importWithUuidSanitation(): void {
    if (!this.ndexLinkToUpload) {
      this.loadingFetch = false;
      return;
    }
    const slashSplit = this.ndexLinkToUpload.trim().split('/');
    const uuid = slashSplit[slashSplit.length - 1];
    this.import(uuid);
  }

  /**
   * Imports data from NDEx after browsing.
   * @param uuid
   * @param browseResultIndex
   */
  import(uuid: string, browseResultIndex: number = -1): void {
    this.loadingFetch = true;
    this.downloadByBrowseResultId = browseResultIndex;

    // download preview
    this.downloadPreview(uuid)
      .toPromise()
      .then((preview: any) => {

        if (!preview.nodeCount || !preview.edgeCount || !this.checkFileElementCount(preview.nodeCount, preview.edgeCount)) {
          return;
        }

        // download network
        this.downloadNetwork(uuid)
          .toPromise()
          .then((data: any[]) => {

            if (!data) {
              return;
            }

            const dataSize = new TextEncoder().encode(JSON.stringify(data)).length;
            this.currentFileSize = Number((dataSize / this.megaFactor).toFixed(2));

            if (!this.checkFileSize()) {
              return;
            } else {
              this.handleFileSizeOk();
            }

            this.storeNetworkLocally(data, uuid);
            this.downloadByBrowseResultId = -1;
          })
          .catch(error => {
            console.error(error);
            this.downloadByBrowseResultId = -1;
          });

      })
      .catch(error => {
        console.error(error);
        this.handleInvalidFile();
        this.downloadByBrowseResultId = -1;
      });
  }

  /**
   * Browse NDEx using a search string.
   * Handles both the private and public search request.
   * Fetches only the first 10 results to avoid unnecessary overhead.
   */
  searchNdex(): void {
    const sanitizedSearchTerm = this.searchTerm.trim();
    if (sanitizedSearchTerm.length === 0) {
      this.showEmptySearchTerm = true;
      setTimeout(() => {
        this.showEmptySearchTerm = false;
      }, 8000);
      return;
    }
    this.loadingSearch = true;
    const body: any = {
      searchString: sanitizedSearchTerm
    };

    if (this.searchVisibility === Visibility.private) {
      body.accountName = this.authService.accountName;
    }

    const url = this.authService.ndexPublicApiHost + 'search/network?size=10';

    this.http.post(url, body, {headers: this.authService.getRequestOptions()})
      .toPromise()
      .then((data: NeSearchResultNetwork) => {
        const valid = this.dataService.handleSearchData(data, this.searchVisibility, this.elementLimit);
        if (!valid) {
          this.handleEmptyResult();
        }
      })
      .catch((error) => console.log(error))
      .finally(() => this.loadingSearch = false);
  }

  /**
   * Get all networks associated with a user's account.
   */
  browseNdex(): void {
    this.loadingSearch = true;
    const options = {headers: this.authService.getRequestOptions()};
    const url = `${this.authService.ndexPublicApiHost}user/${this.authService.accountUuid}/networksummary?offset=0&limit=100`;
    this.http.get(url, options)
      .toPromise()
      .then((data: NeSearchResultItem[]) => {
        console.log(data);
        const valid = this.dataService.handleBrowseData(data, this.elementLimit);
        if (!valid) {
          this.handleEmptyResult();
        }
      })
      .catch((error) => console.log(error))
      .finally(() => this.loadingSearch = false);
  }

  // /**
  //  * Handles the data received as a result from search or browse requests
  //  * @param data Payload
  //  * @param raw True, if the list of received networks is not wrapped within a networks object
  //  * @private
  //  */
  // private handleReceivedData(data: NeSearchResultNetwork | NeSearchResultItem[], raw: boolean): void {
  //   if (!raw) {
  //     data = data as NeSearchResultNetwork;
  //     if (data.numFound === 0) {
  //       this.handleEmptyResult();
  //     }
  //     data.networks.forEach((network) => {
  //       network.downloadable = network.nodeCount < this.elementLimit && network.edgeCount < this.elementLimit;
  //     });
  //     this.searchResult = data.networks;
  //   } else {
  //     data = data as NeSearchResultItem[];
  //     if (data.length === 0) {
  //       this.handleEmptyResult();
  //     }
  //     data.forEach((network) => {
  //       network.downloadable = network.nodeCount < this.elementLimit && network.edgeCount < this.elementLimit;
  //     });
  //     this.searchResult = data;
  //   }
  // }

  /**
   * If the query did not return any networks,
   * we display an alert for 8 seconds.
   * @private
   */
  private handleEmptyResult(): void {
    this.showEmptySearchTerm = false;
    this.showEmptyBrowseResult = true;
    setTimeout(() => {
      this.showEmptyBrowseResult = false;
    }, 8000);
    return;
  }

  /**
   * Returns true, if the number of nodes and edges is lower than the {@link elementLimit}.
   * @param nodeCount Number of nodes in the network summary
   * @param edgeCount Number of edges in the network summary
   * @private
   */
  private checkFileElementCount(nodeCount: number, edgeCount: number): boolean {
    if (nodeCount > this.elementLimit || edgeCount > this.elementLimit) {
      this.nodeCount = nodeCount;
      this.edgeCount = edgeCount;
      this.showInvalidFile = false;
      this.showEmptySearchTerm = false;
      this.showEmptyBrowseResult = false;
      this.showFileElementCountTooBig = true;
      this.showFileSizeTooLargeAlert = false;
      this.showFileNotValidAlert = false;
      this.showFileSizeOkAlert = false;
      this.loadingFetch = false;

      setTimeout(() => {
        this.showFileElementCountTooBig = false;
      }, 8000);

      return false;
    }
    return true;
  }

  /**
   * Returns true if the file size is lower than the {@link sizeLimit}.
   * @private
   */
  private checkFileSize(): boolean {
    if (this.currentFileSize > this.sizeLimit) {
      this.showFileSizeTooLargeAlert = true;
      this.showInvalidFile = false;
      this.showEmptySearchTerm = false;
      this.showEmptyBrowseResult = false;
      this.showFileElementCountTooBig = false;
      this.showFileNotValidAlert = false;
      this.showFileSizeOkAlert = false;
      this.loadingFetch = false;

      setTimeout(() => {
        this.showFileSizeTooLargeAlert = false;
      }, 8000);

      return false;
    }
    return true;
  }

  /**
   * Displays the success alert.
   * @private
   */
  private handleFileSizeOk(): void {
    this.showFileSizeOkAlert = true;
    this.showEmptySearchTerm = false;
    this.showEmptyBrowseResult = false;
    this.showInvalidFile = false;
    this.showFileElementCountTooBig = false;
    this.showFileSizeTooLargeAlert = false;
    this.showFileNotValidAlert = false;
    this.loadingFetch = false;

    setTimeout(() => {
      this.showFileSizeOkAlert = false;
    }, 8000);
  }

  /**
   * Displays the alert that a file has the wrong extension.
   * @private
   */
  private handleInvalidFile(): void {
    this.showInvalidFile = true;
    this.showEmptySearchTerm = false;
    this.showEmptyBrowseResult = false;
    this.showFileElementCountTooBig = false;
    this.showFileSizeTooLargeAlert = false;
    this.showFileNotValidAlert = false;
    this.showFileSizeOkAlert = false;
    this.loadingFetch = false;

    setTimeout(() => {
      this.showInvalidFile = false;
    }, 8000);

    return;
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
      this.showEmptyBrowseResult = false;
      this.showEmptySearchTerm = false;
      this.showFileElementCountTooBig = false;
      this.showFileSizeOkAlert = false;
      this.showFileNotValidAlert = false;
      this.fileToUpload = null;

      setTimeout(() => {
        this.showFileSizeTooLargeAlert = false;
      }, 8000);

    } else if (fileExtension !== 'cx') {

      this.invalidExtension = fileExtension;
      this.showEmptySearchTerm = false;
      this.showEmptyBrowseResult = false;
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
      this.showEmptySearchTerm = false;
      this.showEmptyBrowseResult = false;

      setTimeout(() => {
        this.showFileSizeOkAlert = false;
      }, 8000);
    }
  }

  /**
   * Downloads the network summary from NDEx via UUID.
   * @param uuid the network's ID
   * @private
   */
  private downloadPreview(uuid: string): Observable<any> {
    let options = {};
    if (this.authService.isOnline) {
      options = {headers: this.authService.getRequestOptions()};
    }
    return this.http.get(this.authService.ndexPublicApiHost + 'network/' + uuid + '/summary', options);
  }

  /**
   * Downloads the network data from NDEx via UUID.
   * @param uuid the network's ID
   * @private
   */
  private downloadNetwork(uuid: string): Observable<any> {
    let options = {};
    if (this.authService.isOnline) {
      options = {headers: this.authService.getRequestOptions()};
    }
    return this.http.get(this.authService.ndexPublicApiHost + 'network/' + uuid, options);
  }

  /**
   * Stores the network's data within the {@link dataService#networksDownloaded}.
   * @param data network data
   * @param uuid network's ID
   * @private
   */
  private storeNetworkLocally(data: any, uuid: string): void {
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
      .finally(() => {
        this.loadingFetch = false;
      });
  }

  /**
   * Defines whether to browse private and public networks.
   * If the user wants to access private networks, but is not yet logged in,
   * we display an alert.
   */
  setSearchVisibility(visibility: Visibility): void {
    this.searchVisibility = visibility;

    if (this.searchVisibility === Visibility.private) {
      if (!this.authService.isOnline) {
        this.showUserOfflineWantsPrivate = true;
        setTimeout(() => {
          this.showUserOfflineWantsPrivate = false;
        }, 8000);
      }
    } else {
      this.showUserOfflineWantsPrivate = false;
    }
  }
}
