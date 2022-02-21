import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {NeSearchResultUser} from '../models/ne-search-result-user';
import {DataService} from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * NDEx's public API endpoint
   */
  readonly ndexPublicApiHost = 'https://public.ndexbio.org/v2/';

  /**
   * Local copy of the user's password.
   * Will be encoded base64 and sent as Authorization header.
   * @private
   */
  private password: string = null;

  /**
   * Local copy of the user's account name
   */
  accountName: string = null;

  /**
   * UUID for the registered user
   */
  accountUuid: string = null;

  /**
   * True, if the user has stored any credentials that are used during requests.
   */
  isOnline = false;

  /**
   * Constructor
   * @param http necessary for making HTTP request to NDEx
   */
  constructor(private http: HttpClient, private dataService: DataService) {
  }

  /**
   * Returns account name and password in a base64 encoded format to use in Authentication header.
   * Used internally for the yet to be confirmed username and password.
   * @param username Name of user
   * @param password Password of user
   * @private
   */
  private static getAuthorizationParam(username: string, password: string): string {
    return 'Basic ' + btoa(`${username}:${password}`);
  }

  /**
   * Verifies user's credentials by sending a simple authorized request to the NDEx API.
   * @param username Name of the user
   * @param password Password of the user
   */
  verify(username: string, password: string): Observable<NeSearchResultUser> {
    const url = `${this.ndexPublicApiHost}search/user?size=1`;
    const body = {
      searchString: username
    };

    return (this.http.post(url, body, {
      headers: {Authorization: AuthService.getAuthorizationParam(username, password)}
    }) as Observable<NeSearchResultUser>);
  }

  /**
   * Stores credentials.
   * @param username Name of the user
   * @param password Password of the user
   * @param uuid UUID of the user
   */
  login(username: string, password: string, uuid: string): void {
    this.accountName = username;
    this.accountUuid = uuid;
    this.password = password;
    this.isOnline = true;
  }

  /**
   * Removes the stored credentials
   * and clears the list of private networks in {@link DataService#ndexPrivateNetworks}.
   */
  logout(): boolean {
    this.accountName = null;
    this.password = null;
    this.accountUuid = null;
    this.isOnline = false;
    this.dataService.ndexPrivateNetworks = null;
    this.dataService.ndexPublicNetworks = null;
    return true;
  }

  /**
   * Returns account name and password in a base64 encoded format to use in Authentication header.
   */
  private getAuthorization(): string {
    return 'Basic ' + btoa(`${this.accountName}:${this.password}`);
  }

  /**
   * Returns an options array containing the user's authorization
   */
  getRequestOptions(): HttpHeaders {
    if (!this.isOnline) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      Authorization: this.getAuthorization(),
      'Content-Type': 'application/json'
    });
  }

}
