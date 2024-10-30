import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodeReaderComponent } from "./code-reader/code-reader.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CodeReaderComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  myCallback(detectedCodes: string[]): void {
    console.log("Códigos detectados:", detectedCodes);
  }
  title = 'code_reader';
}
