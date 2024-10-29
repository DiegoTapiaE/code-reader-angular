import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeReaderComponent } from './code-reader.component';

describe('CodeReaderComponent', () => {
  let component: CodeReaderComponent;
  let fixture: ComponentFixture<CodeReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeReaderComponent],
    }).compileComponents();
    
    fixture = TestBed.createComponent(CodeReaderComponent);
    component = fixture.componentInstance;

    // Spy para el EventEmitter para evitar el error de método no implementado
    spyOn(component.on_detect, 'emit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit code on manual submit', () => {
    component.manual_code = '1234567890';
    component.manualSubmit();
    expect(component.on_detect.emit).toHaveBeenCalledWith('1234567890');
  });
});
