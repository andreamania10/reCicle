import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stop();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should normalize unread notifications from API result shape', () => {
    service.start(51, 'token-test');

    const req = httpMock.expectOne(`${environment.apiUrl}/api/notifications/user`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-test');
    req.flush({
      result: [
        {
          id: 19,
          user_id: 51,
          type: 'Articulo_Rechazado',
          content: 'Tu artículo ha sido retirado.',
          reference_id: 10,
          is_read: 0,
          created_at: '2026-06-27T14:22:17.000Z',
        },
      ],
    });

    expect(service.notifications()).toEqual([
      {
        id: 19,
        user_id: 51,
        title: 'Articulo rechazado',
        message: 'Tu artículo ha sido retirado.',
        read: false,
        type: 'Articulo_Rechazado',
        reference_id: 10,
        created_at: '2026-06-27T14:22:17.000Z',
      },
    ]);
    expect(service.unreadCount()).toBe(1);
  });

  it('should ignore read notifications returned by the API', () => {
    service.start(51, 'token-test');

    const req = httpMock.expectOne(`${environment.apiUrl}/api/notifications/user`);
    req.flush({
      result: [
        {
          id: 20,
          type: 'Articulo_Aprobado',
          content: 'Publicado',
          is_read: 1,
        },
      ],
    });

    expect(service.notifications()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });
});
