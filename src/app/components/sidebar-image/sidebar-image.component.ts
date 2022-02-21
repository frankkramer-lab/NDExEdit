import {Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {
  faArrowLeft,
  faFileSignature,
  faInfo,
  faPlus,
  faQuestionCircle,
  faRedo,
  faThumbsDown,
  faThumbsUp,
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import {GraphService} from '../../services/graph.service';
import {LayoutService} from '../../services/layout.service';
import {AuthService} from '../../services/auth.service';
import {UtilityService, Visibility} from '../../services/utility.service';
import {HttpClient} from '@angular/common/http';
import {NeSearchResultItem} from '../../models/ne-search-result-item';

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
   * Icon: faUsers
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUsers = faUsers;
  /**
   * Icon: faUser
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUser = faUser;
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
   * Icon: faFileSignature
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faFileSignature = faFileSignature;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faInfo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faInfo = faInfo;
  /**
   * Icon: faQuestionCircle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faQuestionCircle = faQuestionCircle;
  /**
   * Icon: faThumbsUp
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faThumbsUp = faThumbsUp;
  /**
   * Icon: faThumbsDown
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faThumbsDown = faThumbsDown;
  /**
   * Possible file types
   */
  downloadOptions: string[] = [
    'PNG',
    'JPEG',
    'CX',
    'NDEx'
  ];

  /**
   * Selected file type
   */
  selectedFileType = 'CX';
  /**
   * True, if the user is not online, but wants to push a network to NDEx.
   * Used to display the corresponding alert.
   */
  alertCannotPushToNdex = false;
  /**
   * True, if pushing a new network to NDEx succeeds.
   * Used to display the respective alert.
   */
  alertNewSuccess = false;
  /**
   * True, if pushing a new network to NDEx fails.
   * Used to display the respective alert.
   */
  alertNewFailure = false;
  /**
   * True, if overriding a network on NDEx succeeds.
   * Used to display the respective alert.
   */
  alertOverrideSuccess = false;
  /**
   * True, if overriding a network on NDEx fails.
   * Used to display the respective alert.
   */
  alertOverrideFailure = false;
  /**
   * True, if the user decides to override an existing network from his or her NDEx account
   * when pushing the network to NDEx
   */
  overrideExistingNetwork = false;
  /**
   * Possibly we get a response from NDEx regarding an upload,
   * such as the newly created network's UUID.
   */
  ndexUploadResponse: string = null;
  /**
   * True, if the user is currently uploading a network to NDEx.
   * Used to display a spinner.
   */
  requestInProgress = false;

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
   * Visibility for a network that is to be created in the user's NDEx account.
   * By default, the network will be only visible privately.
   */
  visibility: Visibility = Visibility.private;

  /**
   * Index pointing towards a network to show its description.
   */
  displayNetworkPreview = -1;
  /**
   * UUID for a network that is currently being checked for permission.
   * Null if the request is done.
   */
  checkingPermissionFor: string = null;
  /**
   * Contains the network's UUID that should be overridden
   * when pushing to NDEx.
   */
  markedForOverride: NeSearchResultItem = null;

  /**
   * Constructor
   * @param dataService service responsible for data access
   * @param graphService service responsible for graph manipulations
   * @param layoutService service responsible for tooltip directions
   * @param authService service responsible for user auth and HTTP requests
   * @param utilityService service responsible for enum management
   * @param http
   */
  constructor(
    public dataService: DataService,
    public graphService: GraphService,
    public layoutService: LayoutService,
    public authService: AuthService,
    public utilityService: UtilityService,
    public http: HttpClient
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
      case 'NDEx':
        this.pushToNdex();
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
    if (option === 'NDEx' && !this.authService.isOnline) {
      this.alertCannotPushToNdex = true;
      setTimeout(() => {
        this.alertCannotPushToNdex = false;
      }, 8000);
    }
  }

  /**
   * Builds and returns this network's file name
   * @private
   */
  private getFilename(): string {
    const network = this.dataService.selectedNetwork;

    let filename;
    if (!!network.networkInformation.name) {
      filename = network.networkInformation.name;
    } else if (!!network.networkInformation.uuid) {
      filename = network.networkInformation.uuid;
    } else {
      filename = 'ndex_edit_network_' + this.dataService.networksParsed.indexOf(this.dataService.selectedNetwork).toString();
    }
    return filename;
  }

  pushToNdex(): void {
    if (this.overrideExistingNetwork) {
      if (this.markedForOverride !== null) {

        this.requestInProgress = true;
        const url = `${this.authService.ndexPublicApiHost}network/${this.markedForOverride.externalId}`;
        this.http.put(url, this.dataService.selectedNetwork.cx, {
          headers: this.authService.getRequestOptions(),
          responseType: 'text'
        })
          .toPromise()
          .then((response) => {
            this.handleNdexPush(true, true);
            this.refreshList();
          })
          .catch((error) => {
            this.handleNdexPush(false, true);
          })
          .finally(() => {
            this.requestInProgress = false;
          });
      }

    } else {

      this.requestInProgress = true;
      const url = `${this.authService.ndexPublicApiHost}network?visibility=${this.visibility === Visibility.private ? 'PRIVATE' : 'PUBLIC'}`;

      this.http.post(url, this.dataService.selectedNetwork.cx, {
        headers: this.authService.getRequestOptions(),
        responseType: 'text'
      })
        .toPromise()
        .then((response) => {
          console.log(response);
          const splitted = response.split('/');
          this.handleNdexPush(true, false, splitted[splitted.length - 1]);
        })
        .catch((error) => {
          console.log(error);
          this.handleNdexPush(false, false);
        })
        .finally(() => this.requestInProgress = false);
    }
  }

  /**
   * Handles alerts when a push to NDEx is finished.
   * @param successful True, if the request was successful
   * @param override True, if the request was a PUT, not a POST
   * @param response [opt] string containing the UUID for a network
   * @private
   */
  private handleNdexPush(successful: boolean, override: boolean, response?: string): void {
    if (successful) {
      // successful
      this.alertNewFailure = false;
      this.alertOverrideFailure = false;

      if (override) {
        this.alertOverrideSuccess = true;
        this.alertNewSuccess = false;
      } else {
        this.alertOverrideSuccess = false;
        this.alertNewSuccess = true;
      }

    } else {
      // not successful
      this.alertNewSuccess = false;
      this.alertOverrideSuccess = false;

      if (override) {
        this.alertOverrideFailure = true;
        this.alertNewFailure = false;
      } else {
        this.alertOverrideFailure = false;
        this.alertNewFailure = true;
      }
    }
    this.ndexUploadResponse = response ? ('https://www.ndexbio.org/viewer/networks/' + response) : null;
    setTimeout(() => {
      this.alertNewSuccess = false;
      this.alertNewFailure = false;
      this.alertOverrideSuccess = false;
      this.alertOverrideFailure = false;
    }, 8000);
  }

  /**
   * Download the network as CX file
   */
  downloadCx(): void {
    this.dataService.removeNdexStatus();
    const network = this.dataService.selectedNetwork;

    const blob = new Blob([JSON.stringify(network.cx)], {type: 'application/octet-stream'});
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', this.getFilename() + '.cx');
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
    a.setAttribute('download', (this.getFilename()) + file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Defines, if the new network should be accessible privately or publicly.
   */
  setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
  }

  /**
   * Toggles the override mode.
   * When entering override mode, we fetch all networks linked to a user's account.
   * But only if he has no items in his list of private networks.
   * @param override
   */
  async setOverride(override: boolean): Promise<void> {
    this.overrideExistingNetwork = override;
    // if we enter override mode and we have never made the account fetch,
    // we do that now
    if (override &&
      (this.dataService.ndexPrivateNetworks === null || this.dataService.ndexPrivateNetworks.length === 0)) {
      await this.browse();
    }

    if (this.dataService.selectedNetwork) {
      const uuidOfInterest = this.dataService.selectedNetwork.networkInformation.uuid;
      this.dataService.ndexPrivateNetworks.sort((a, b) => a.externalId === uuidOfInterest ? -1 : 1);
    }
  }

  /**
   * Checks permission for the given network.
   * Updates the information in {@link DataService#ndexPrivateNetworks} for app-wide access.
   * @param networkUuid ID for this network.
   */
  checkPermission(networkUuid: string): void {
    this.checkingPermissionFor = networkUuid;
    this.requestInProgress = true;
    const options = {headers: this.authService.getRequestOptions()};
    this.http.get(`${this.authService.ndexPublicApiHost}user/${this.authService.accountUuid}/permission?networkid=${networkUuid}`, options)
      .subscribe(
        (permission) => {
          const network = this.dataService.ndexPrivateNetworks.find(a => a.externalId === networkUuid);
          console.log(network);
          console.log(network.isReadOnly === true);
          console.log(permission);
          network.writable = (!network.isReadOnly && (permission[networkUuid] === 'WRITE' || permission[networkUuid] === 'ADMIN'));
          console.log(network);

          network.checkedPermission = true;
          this.checkingPermissionFor = null;
          this.requestInProgress = false;
        },
        (error) => {
          this.checkingPermissionFor = null;
          this.requestInProgress = false;
        },
      );
  }

  /**
   * Marks the specified UUID as "to override"
   * when pushing to NDEx.
   * @param network the network to override
   */
  markToOverride(network: NeSearchResultItem): void {
    this.markedForOverride = (this.markedForOverride === network ? null : network);
  }

  /**
   * Triggers the account browse
   */
  refreshList(): void {
    this.browse();
    this.markedForOverride = null;
  }

  /**
   * Browses the user's NDEx account
   * @private
   */
  private async browse(): Promise<boolean> {
    this.requestInProgress = true;

    const url = `${this.authService.ndexPublicApiHost}user/${this.authService.accountUuid}/networksummary`;
    const options = {headers: this.authService.getRequestOptions()};

    const response: NeSearchResultItem[] = await this.http.get(url, options).toPromise() as NeSearchResultItem[];

    const valid = this.dataService.handleBrowseData(response, Number.MAX_SAFE_INTEGER);
    this.requestInProgress = false;
    return valid;
  }
}
