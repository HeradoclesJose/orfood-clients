import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabOrdersCompletedPage } from './tab-orders-completed.page';

describe('TabOrdersCompletedPage', () => {
  let component: TabOrdersCompletedPage;
  let fixture: ComponentFixture<TabOrdersCompletedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabOrdersCompletedPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabOrdersCompletedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
