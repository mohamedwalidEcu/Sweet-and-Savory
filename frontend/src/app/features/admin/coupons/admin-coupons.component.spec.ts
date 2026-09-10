import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCouponsComponent } from './admin-coupons.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('AdminCouponsComponent', () => {
  let component: AdminCouponsComponent;
  let fixture: ComponentFixture<AdminCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCouponsComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
