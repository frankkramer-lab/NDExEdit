import {Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-sidebar-image',
  templateUrl: './sidebar-image.component.html',
  styleUrls: ['./sidebar-image.component.scss']
})
export class SidebarImageComponent implements OnInit {

  constructor(private dataService: DataService) {
  }

  fileOptions: string[] = [
    'PNG',
    'JPEG'
  ];

  selectedFileOption: string;

  optFull: boolean;
  optScale: number;
  optBg: string;
  optHeight: number;
  optWidth: number;

  url: string;

  ngOnInit(): void {
  }

  downloadImagePNG(): void {

    this.url = window.URL.createObjectURL(this.dataService.selectedNetwork.core.png({
      output: 'blob',
      full: this.optFull ?? null,
      bg: this.optBg ?? null,
      maxHeight: this.optHeight ?? null,
      maxWidth: this.optWidth ?? null
    }));

    this.download('png');
  }

  downloadImageJPEG(): void {
    this.url = window.URL.createObjectURL(this.dataService.selectedNetwork.core.jpeg({
      output: 'blob',
      full: this.optFull ?? null,
      bg: this.optBg ?? null,
      maxHeight: this.optHeight ?? null,
      maxWidth: this.optWidth ?? null
    }));
    this.download('jpeg');
  }

  private download(file: string): void {
    const a = document.createElement('a');
    a.href = this.url;
    a.setAttribute('download', (this.dataService.selectedNetwork.networkInformation.name || 'network_image') + '.' + file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
