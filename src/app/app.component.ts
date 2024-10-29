import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodeReaderComponent } from "./code-reader/code-reader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CodeReaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  myCallback(detectedCodes: string[]): void {
    console.log("Códigos detectados:", detectedCodes);
  }
  title = 'code_reader';
}
