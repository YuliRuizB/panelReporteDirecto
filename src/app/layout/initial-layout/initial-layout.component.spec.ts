import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialLayoutComponent } from './initial-layout.component';

describe('InitialLayoutComponent', () => {
  let component: InitialLayoutComponent;
  let fixture: ComponentFixture<InitialLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InitialLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitialLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
