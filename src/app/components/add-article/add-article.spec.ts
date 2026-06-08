import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticle } from './add-article';

describe('AddArticle', () => {
  let component: AddArticle;
  let fixture: ComponentFixture<AddArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
