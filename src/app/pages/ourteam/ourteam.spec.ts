import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ourteam } from './ourteam';

describe('Ourteam', () => {
  let component: Ourteam;
  let fixture: ComponentFixture<Ourteam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ourteam],
    }).compileComponents();

    fixture = TestBed.createComponent(Ourteam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
