import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import { SolutionPageComponent } from './solution-page.component';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {ReservationService} from '../../reservation/reservation.service';
import {BookingAServiceComponent} from '../../reservation/booking-a-service/booking-a-service.component';
import {CreateReservationServiceDTO} from '../../shared/dto/reservations/CreateReservationServiceDTO.model';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectChange} from '@angular/material/select';
import {ActivatedRoute} from '@angular/router';
import {HttpClientTestingModule} from '@angular/common/http/testing';


describe('SolutionPageComponent', () => {
  let component: SolutionPageComponent;
  let fixture: ComponentFixture<SolutionPageComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let reservationService: jasmine.SpyObj<ReservationService>;

  beforeEach(async () => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    reservationService = jasmine.createSpyObj('ReservationService', ['bookService']);

    await TestBed.configureTestingModule({
      declarations: [SolutionPageComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatDatepickerModule
      ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: ReservationService, useValue: reservationService },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['afterClosed']) },
        { provide: ActivatedRoute, useValue: { params: of({ id: '123' }) } } // ovo
      ]
    }).compileComponents();

      fixture = TestBed.createComponent(SolutionPageComponent);
      component = fixture.componentInstance;
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      reservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;

  });

  it('should send correct reservation when booking confirmed', fakeAsync(() => {
    const mockDialogRef = jasmine.createSpyObj<MatDialogRef<BookingAServiceComponent>>('MatDialogRef', ['afterClosed']);
    mockDialogRef.componentInstance = {
      selectedStartTime: new Date(),
      selectedEndTime: new Date()  } as any;
    mockDialogRef.afterClosed.and.returnValue(of(true));
    dialog.open.and.returnValue(mockDialogRef);


    reservationService.bookService.and.returnValue(of({}));

    const loadSpy = spyOn(component, 'loadSolution');

    component.solution = { id: 'sol1' } as any;

    component['bookService']('event1');
    tick();

    expect(dialog.open).toHaveBeenCalledWith(BookingAServiceComponent, jasmine.any(Object));
    expect(reservationService.bookService).toHaveBeenCalledTimes(1);

    const dto: CreateReservationServiceDTO = reservationService.bookService.calls.mostRecent().args[0];
    expect(dto.eventId).toBe('event1');
    expect(dto.productId).toBe('sol1');
    expect(dto.from instanceof Date).toBeTrue();
    expect(dto.to instanceof Date).toBeTrue();

    expect(loadSpy).toHaveBeenCalled();
  }));

  it('should do nothing if dialog closed without booking', fakeAsync(() => {
    const mockDialogRef = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(null));
    dialog.open.and.returnValue(mockDialogRef);

    component['bookService']('event1');
    tick();

    expect(reservationService.bookService).not.toHaveBeenCalled();
  }));

  it('should handle error if booking fails', fakeAsync(() => {
    const mockDialogRef = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockDialogRef.componentInstance = {
      selectedStartTime: new Date('2025-10-20T10:00:00Z'),
      selectedEndTime: new Date('2025-10-20T11:00:00Z')
    };

    dialog.open.and.returnValue(mockDialogRef);
    reservationService.bookService.and.returnValue(throwError(() => ({ error: { message: 'Booking failed' } })));

    spyOn(console, 'error');

    component.solution = { id: 'sol1' } as any;

    component['bookService']('event1');
    tick();

    expect(console.error).toHaveBeenCalledWith('Error booking service', { error: { message: 'Booking failed' } });
  }));


});
