import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', loadChildren: './Pages/login/login.module#LoginPageModule'},
    { path: 'order-details', loadChildren: './Pages/order-details/order-details.module#OrderDetailsPageModule' },
    { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
