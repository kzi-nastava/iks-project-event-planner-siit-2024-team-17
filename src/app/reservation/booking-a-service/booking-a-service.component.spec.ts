import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingAServiceComponent } from './booking-a-service.component';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { ReservationService } from '../reservation.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

describe('BookingAServiceComponent', () => {
    let component: BookingAServiceComponent;
    let fixture: ComponentFixture<BookingAServiceComponent>;
    let mockReservationService: jasmine.SpyObj<ReservationService>;

    beforeEach(async () => {
        mockReservationService = jasmine.createSpyObj('ReservationService', ['getAvailableTerms']);

        await TestBed.configureTestingModule({
          imports: [
            ReactiveFormsModule,
            MatDialogModule,
            MatButtonModule,
            MatDatepickerModule,
            MatNativeDateModule,
            MatSelectModule,
            MatInputModule,
            BrowserAnimationsModule
          ],
          declarations: [BookingAServiceComponent],
            providers: [
                { provide: ReservationService, useValue: mockReservationService },
                    { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                        {
                            provide: MAT_DIALOG_DATA,
                            useValue: {
                                eventId: '1',
                                solution: {
                                    id: 'sol1',
                                    durationMinutes: 60,
                                    reservationWindowDays: 2,
                                    applicableEvents: [
                                      { id: '1', time: new Date().toISOString() }
                                ]
                        }
                    }
                }
          ]
        }).compileComponents();

        fixture = TestBed.createComponent(BookingAServiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

  beforeEach(() => {
    spyOn(Date.prototype, 'toLocaleTimeString').and.callFake(function(this: Date) {
      const hours = this.getUTCHours().toString().padStart(2, '0');
      const minutes = this.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });
  });



  it('should create the BookingAServiceComponent', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with date and startTime controls', () => {
        expect(component.bookingForm.contains('date')).toBeTrue();
        expect(component.bookingForm.contains('startTime')).toBeTrue();
    });

    it('should not allow past dates in dateFilter', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        expect(component.dateFilter(pastDate)).toBeFalse();
    });

    it('should fetch available terms and convert them to strings', () => {
        const mockDates = [new Date('2025-10-20T10:00:00Z'), new Date('2025-10-20T11:00:00Z')];
        mockReservationService.getAvailableTerms.and.returnValue(of(mockDates));

        component.selectedDate = new Date('2025-10-20');
        component.fetchAvailableTerms();

        expect(mockReservationService.getAvailableTerms).toHaveBeenCalled();
        expect(component.freeTerms).toEqual(['10:00', '11:00']);
    });

    it('should calculate end time correctly when a term is selected', () => {
        component.solution.durationMinutes = 60;
        component.selectedDate = new Date('2025-10-20T00:00:00');
        component.changeTerm({ value: '10:00' } as any);

        expect(component.selectedStartTime.getHours()).toBe(10);
        expect(component.selectedEndTime.getHours()).toBe(11);
        expect(component.endTimeString.startsWith('11')).toBeTrue();
    });

    it('should close dialog on book()', () => {
        component.book();
        expect((TestBed.inject(MatDialogRef) as any).close).toHaveBeenCalledWith(true);
    });


});
