import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ParseService} from './services/parse.service';
import {NeNetwork} from './models/ne-network';
import {DataService} from './services/data.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

/**
 * Root component of the application
 */
export class AppComponent {
  title = 'ndex-edit';

  /**
   * Path to mock-ups
   */
  private readonly mockedFilepath = '/assets/mocks/';

  /**
   * Array of currently supported languages, which is easily expansable
   */
  private readonly supportedLanguages = ['en', 'de'];

  /**
   * Default language is English
   */
  private readonly defaultLanguage = 'en';

  constructor(
    public translateService: TranslateService,
    private parseService: ParseService,
    public dataService: DataService,
    private http: HttpClient) {
    this.initializeTranslation();

    this.initDemoNetwork('01.cx');
    this.initDemoNetwork('02.cx');
    this.initDemoNetwork('03.cx');
    this.initDemoNetwork('04.cx');

  }

  /**
   * Using set browser language to determine which language to use within the frontend
   */
  private initializeTranslation(): void {
    this.translateService.setDefaultLang(this.defaultLanguage);

    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use((browserLang && this.supportedLanguages.includes(browserLang)) ? browserLang : this.defaultLanguage);
  }

  /**
   * For development purposes this method loads the specified file from the assets directory and adds the files to both the
   * {@link dataService#networksDownloaded|loaded} and
   * {@link dataService#networksParsed|parsed networks} accessible through the {@link dataService|dataService}.
   * @param filename name of the file to be loaded, parsed and added
   */
  private initDemoNetwork(filename: string): void {
    this.loadFileFromAssets(filename)
      .then(network => {
        const parsedNetwork = this.parseFileFromAssets(network);
        this.dataService.networksDownloaded.push(network);
        this.dataService.networksParsed.push(parsedNetwork);
      })
      .catch(error => console.log(error));
  }

  /**
   * Method to parse the specified network from .cx to cytoscape format
   * @param network network file in .cx format
   */
  private parseFileFromAssets(network: any): NeNetwork {
    return this.parseService.mockedFiles(network);
  }

  /**
   * Method making an http request to load the file from the assets directory
   * @param filename name of the file to be loaded
   */
  private loadFileFromAssets(filename: string): Promise<any> {
    return this.http.get(this.mockedFilepath.concat(filename))
      .toPromise()
      .then(data => data)
      .catch(error => console.log(error));
  }

}
