import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleCardComponent } from './article-card';

describe('ArticleCard', () => {
  let component: ArticleCardComponent;
  let fixture: ComponentFixture<ArticleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
