import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabOrdersPage } from './tab-orders.page';

describe('TabOrdersPage', () => {
  let component: TabOrdersPage;
  let fixture: ComponentFixture<TabOrdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabOrdersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
