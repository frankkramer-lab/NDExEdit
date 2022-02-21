import {Component, EventEmitter, Output} from '@angular/core';
import {faGlobe, faHome, faUser, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {LayoutService} from '../../services/layout.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidebar-navbar',
  templateUrl: './sidebar-navbar.component.html',
  styleUrls: ['./sidebar-navbar.component.scss']
})
export class SidebarNavbarComponent {
  /**
   * Icon: faHome
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faHome = faHome;
  /**
   * Icon: faUser
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUser = faUser;
  /**
   * Icon: faUserCircle
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUserCircle = faUserCircle;
  /**
   * Icon: faGlobe
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faGlobe = faGlobe;
  /**
   * Name of user's NDEx account entered in the form.
   */
  ndexAccountName: string;
  /**
   * The user's password to his NDEx account entered in the form.
   */
  ndexPassword: string;
  /**
   * True, if the user leaves name or password blank.
   * Shows the corresponding alert.
   */
  alertEmptyNameOrPw = false;
  /**
   * True, if the user's credentials could not be verified.
   * Shows the corresponding alert.
   */
  alertVerificationFailed = false;
  /**
   * True, if the user was successfully logged out.
   * Shows the corresponding alert.
   */
  alertLoggedOut = false;
  /**
   * True, if the username-password-verification is in progress.
   * Used to display spinner instead of button.
   */
  verificationInProgress = false;

  /**
   * Emits the current language if the user decides to change it manually
   */
  @Output() languageEmitter = new EventEmitter<string>();

  constructor(
    public layoutService: LayoutService,
    public dataService: DataService,
    public authService: AuthService,
    private modalService: NgbModal) {
  }


  /**
   * Triggers the language emitter, updating the language throughout the application
   * @param lang name of language
   */
  setLanguage(lang: string): void {
    this.languageEmitter.emit(lang);
  }

  /**
   * Opens the modal to show the connection to NDEx.
   * @param modalContent Content of the modal. Managed in {@link SidebarNavbarComponent}
   */
  openAuthModal(modalContent): void {
    this.modalService.open(modalContent, {size: 'xl'});
  }

  /**
   * Stores the user's credentials in the {@link AuthService}
   */
  login(): void {
    if (!this.ndexAccountName || !this.ndexPassword) {
      this.alertEmptyNameOrPw = true;
      this.alertVerificationFailed = false;
      this.alertLoggedOut = false;
      setTimeout(() => {
        this.alertEmptyNameOrPw = false;
      }, 8000);
      return;
    }
    this.verificationInProgress = true;
    this.authService.verify(this.ndexAccountName, this.ndexPassword)
      .subscribe((response) => {
          const uuid = response.resultList[0].externalId;
          this.authService.login(this.ndexAccountName, this.ndexPassword, uuid);
          this.alertEmptyNameOrPw = false;
          this.alertVerificationFailed = false;
          this.ndexAccountName = null;
          this.ndexPassword = null;
          this.verificationInProgress = false;
          return;
        },
        error => {
          this.alertEmptyNameOrPw = false;
          this.alertVerificationFailed = true;
          this.alertLoggedOut = false;
          this.verificationInProgress = false;
          setTimeout(() => {
            this.alertVerificationFailed = false;
          }, 8000);
          return;
        });
  }

  /**
   * Removes the user's credentials from the {@link AuthService}.
   */
  logout(): void {
    this.authService.logout();
    this.alertEmptyNameOrPw = false;
    this.alertLoggedOut = true;
    setTimeout(() => {
      this.alertLoggedOut = false;
    }, 8000);
  }
}
