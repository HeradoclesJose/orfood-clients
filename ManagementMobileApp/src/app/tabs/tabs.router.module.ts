import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab-orders',
        children: [
          {
            path: '',
            loadChildren: '../Pages/tab-orders/tab-orders.module#TabOrdersPageModule'
          }
        ]
      },
      {
        path: 'tab-orders-completed',
        children: [
          {
            path: '',
            loadChildren: '../Pages/tab-orders-completed/tab-orders-completed.module#TabOrdersCompletedPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'tabs/tab-orders',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/tab-orders',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
