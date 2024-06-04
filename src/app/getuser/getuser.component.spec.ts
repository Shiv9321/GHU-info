import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GetuserComponent } from './getuser.component';
import { FormsModule } from '@angular/forms';

describe('GetuserComponent', () =>
{
  let component: GetuserComponent;
  let fixture: ComponentFixture<GetuserComponent>;

  beforeEach(async () =>
  {
    await TestBed.configureTestingModule({
      declarations: [GetuserComponent],
      imports: [HttpClientTestingModule,FormsModule]
    }).compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(GetuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});

