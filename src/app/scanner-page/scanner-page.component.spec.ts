import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerPageComponent } from './scanner-page.component';

describe('ScannerPageComponent', () => {
  let component: ScannerPageComponent;
  let fixture: ComponentFixture<ScannerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
