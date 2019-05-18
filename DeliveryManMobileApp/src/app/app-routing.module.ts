import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


// Everytime you add a new page you have to add '/Pages' right after de '.':
const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadChildren: './Pages/login/login.module#LoginPageModule' },
    { path: 'home', loadChildren: './Pages/home/home.module#HomePageModule' },
    { path: 'qr-scanner', loadChildren: './Pages/qr-scanner/qr-scanner.module#QrScannerPageModule' },
    { path: 'map', loadChildren: './Pages/map/map.module#MapPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
