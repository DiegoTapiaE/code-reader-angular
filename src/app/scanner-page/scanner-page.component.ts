import { Component } from '@angular/core';
import { CodeReaderComponent } from "../code-reader/code-reader.component";
import { RouterModule } from '@angular/router';
// import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-scanner-page',
  standalone: true,
  imports: [CodeReaderComponent, RouterModule],
  templateUrl: './scanner-page.component.html',
  styleUrl: './scanner-page.component.css'
})
export class ScannerPageComponent {

  myCallback($event: any) {
    throw new Error('Method not implemented.');
  }


}
