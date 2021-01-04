import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ParseService} from './services/parse.service';
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

  /**
   * Title of the application is NDExEdit
   */
  title = 'NDExEdit';
  /**
   * Main: default page layout is 60%
   */
  widthMain = 60;
  /**
   * Sidebar: default page layout is 38%
   */
  widthSidebar = 38;
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

  /**
   * Initializes translation and renders the desired mock-ups
   *
   * @param translateService Service to manage languages
   * @param parseService Service to handle parsing of mock-ups
   * @param dataService Service to read and write globally accessible data
   * @param http Service to handle HTTP requests and file inputs
   */
  constructor(
    public translateService: TranslateService,
    private parseService: ParseService,
    public dataService: DataService,
    private http: HttpClient
  ) {

    this.initializeTranslation();

    this.initDemoNetwork('DummyForTesting.cx');
  }

  /**
   * Simple implementation to adjust the page layout:
   * <ul>
   *   <li><b>left-click</b>: main view decreases, sidebar increases</li>
   *   <li><b>right-click</b>: main view increases, sidebar decreases</li>
   *   <li><b>Ctrl + left-click</b></li>: resets widths, see {@link AppComponent#resetPageLayout}
   * </ul>
   * @param e event to fetch all pressed keys
   * @param isLeft indicates if the direction is towards the left
   */
  handleClickEvent(e: MouseEvent, isLeft: boolean): void {
    if (e.ctrlKey) {
      this.resetPageLayout();
      return;
    }

    e.preventDefault();
    let tmpMain = this.widthMain;
    let tmpSidebar = this.widthSidebar;

    if (!isLeft && tmpSidebar > 18) {
      tmpMain += 10;
      tmpSidebar -= 10;
      this.widthMain = tmpMain;
      this.widthSidebar = tmpSidebar;
    } else if (isLeft && tmpMain > 20) {
      tmpMain -= 10;
      tmpSidebar += 10;
      this.widthMain = tmpMain;
      this.widthSidebar = tmpSidebar;
    }
  }

  /**
   * Resets page layout to {@link AppComponent#widthMain} and {@link AppComponent#widthSidebar}
   */
  resetPageLayout(): void {
    this.widthSidebar = 38;
    this.widthMain = 60;
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
   * {@link dataService#networksParsed} accessible through the {@link dataService|dataService}.
   * @param filename name of the file to be loaded, parsed and added
   */
  private initDemoNetwork(filename: string): void {
    this.http.get(this.mockedFilepath.concat(filename))
      .toPromise()
      .then((data: any[]) => {
        const parsedNetwork = this.parseService.convert(data, this.mockedFilepath + filename);
        this.dataService.networksDownloaded.push(data);
        this.dataService.networksParsed.push(parsedNetwork);
        // console.log(this.dataService.networksParsed);
      })
      .catch(error => console.log(error));
  }
}
