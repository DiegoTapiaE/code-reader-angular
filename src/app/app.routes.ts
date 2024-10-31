import { Routes } from '@angular/router';
import { ScannerPageComponent } from './scanner-page/scanner-page.component';
import { AppComponent } from './app.component';

export const routes: Routes = [

    {path: '', component: AppComponent},
    {path: 'scanner', component: ScannerPageComponent}

];
