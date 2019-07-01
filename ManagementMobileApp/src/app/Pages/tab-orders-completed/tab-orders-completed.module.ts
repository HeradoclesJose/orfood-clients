import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabOrdersCompletedPage } from './tab-orders-completed.page';

const routes: Routes = [
  {
    path: '',
    component: TabOrdersCompletedPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TabOrdersCompletedPage]
})
export class TabOrdersCompletedPageModule {}
