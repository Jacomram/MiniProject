import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate subtotal correctly', () => {
    component.addDrink('HOT');
    component.addDrink('COLD');
    expect(component.subtotal).toBe(6); // 2 bebidas x $3 cada una
  });

  it('should apply discount successfully', () => {
    spyOn(window, 'alert');
    component.addDrink('HOT');
    component.discountCode = 'WELCOME2025';
    component.applyDiscount();
    expect(component.discount).toBe(0.45); // 15% de $3
    expect(window.alert).toHaveBeenCalledWith('The discount code WELCOME2025 has been successfully applied.');
  });

  it('should recalculate discount dynamically when new drinks are added', () => {
    spyOn(window, 'alert');
    component.addDrink('HOT');
    component.discountCode = 'WELCOME2025';
    component.applyDiscount();
    component.addDrink('COLD'); // Agrega otra bebida después de aplicar el descuento
    expect(component.subtotal).toBe(6); // 2 bebidas x $3 cada una
    expect(component.discount).toBe(0.9); // 15% de $6
    expect(component.total).toBeCloseTo(6.04); // Subtotal - descuento + impuesto
  });

  it('should show alert for invalid discount code', () => {
    spyOn(window, 'alert');
    component.discountCode = 'INVALIDCODE';
    component.applyDiscount();
    expect(window.alert).toHaveBeenCalledWith('Invalid discount code. Please try again.');
  });
});
