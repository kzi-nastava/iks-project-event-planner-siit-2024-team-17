import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatDialogRef} from '../../infrastructure/material/material.module';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {SolutionDetailsDTO} from '../../shared/dto/solutions/solutionDetailsDTO.model';
import {SimpleEventDTO} from '../../shared/dto/events/simpleEventDTO.model';
import {ReservationService} from '../reservation.service';
import {MatSelectChange} from '@angular/material/select';


@Component({
  selector: 'app-booking-a-service',
  templateUrl: './booking-a-service.component.html',
  styleUrl: './booking-a-service.component.css'
})
export class BookingAServiceComponent {

  event: SimpleEventDTO;
  solution: SolutionDetailsDTO;

  selectedDate: Date = null;      //choosen date
  selectedStartTime: Date = null;
  selectedEndTime: Date = null;

  endTimeString: string = "";

  eventDate: Date = null;

  freeTerms:string[] = [];


  constructor(public dialogRef: MatDialogRef<BookingAServiceComponent>,
              private reservationService: ReservationService,
              @Inject(MAT_DIALOG_DATA) data: {eventId: string, solution: SolutionDetailsDTO}
  ) {
    this.solution = data.solution;
    this.event = data.solution.applicableEvents.find((e: SimpleEventDTO): boolean => e.id === data.eventId);
    this.eventDate = new Date(this.event.time);
  }

  bookingForm: FormGroup = new FormGroup ({
    date : new FormControl<Date|null>(null),
    startTime : new FormControl<string>(''),

  });

  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minReservationDate = new Date();
    minReservationDate.setDate(today.getDate() + this.solution.reservationWindowDays);


    const eventDate = new Date(this.event.time);
    eventDate.setHours(0, 0, 0, 0);

    const minEventWindow = new Date(eventDate);
    minEventWindow.setDate(eventDate.getDate() - 3);

    const maxEventWindow = new Date(eventDate);
    maxEventWindow.setDate(eventDate.getDate() + 2);


    // 1. dates from the past can not be selected
    if (d < today) {
      return false;
    }

    // 2. dates in next {reservationWindowDays} can not be selected
    if (d < minReservationDate) {
      return false;
    }

    // 3. service can be booked only max 3 days before event and max 2 days after event
    if (d < minEventWindow || d > maxEventWindow) {
      return false;
    }

    return true;
  };

  dateClass = (d: Date): string => {
    const eventDate = new Date(this.event.time);
    eventDate.setHours(0, 0, 0, 0); // Resetujemo sate za tačno poređenje

    return d.getTime() === eventDate.getTime() ? 'event-date' : '';
  };


  OnDateChange(event: MatDatepickerInputEvent<any, any>){
    this.selectedDate = event.value;
    this.bookingForm.get('date')?.setValue(event.value);

    if (this.selectedDate) {
      this.fetchAvailableTerms();
    }
  }


  fetchAvailableTerms(): void {
    let dateString: string = '';
    let date = this.selectedDate.getDate().toString().padStart(2, '0');
    let month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    let year = this.selectedDate.getFullYear();
    dateString = `${year}-${month}-${date}T00:00:00`;

    this.reservationService.getAvailableTerms(this.solution.id,dateString).subscribe({
      next: event => {
        console.log(event);
        this.convertTermsToString(event);
      },
      error: event => {
        console.error(event);
      }
    });
  }

  convertTermsToString(termsDates: Date[]): void {
    this.freeTerms = termsDates.map(date =>
      date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    );

  }



  book() {
    this.dialogRef.close(true);
  }

  changeTerm(event: MatSelectChange) {

    const [hours, minutes] = event.value.split(":").map(Number);

    this.selectedStartTime = new Date(this.selectedDate);
    this.selectedStartTime.setHours(hours, minutes, 0, 0);

    this.selectedEndTime = new Date(this.selectedStartTime);
    this.selectedEndTime.setMinutes(this.selectedEndTime.getMinutes() + this.solution.durationMinutes);

    this.endTimeString = this.selectedEndTime.toTimeString().padStart(2, '0').slice(0, 8);
  }
}
