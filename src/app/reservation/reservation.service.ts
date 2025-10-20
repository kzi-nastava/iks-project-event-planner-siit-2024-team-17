  import { Injectable } from '@angular/core';
  import {Observable} from 'rxjs';
  import {environment} from '../../env/envirements';
  import {HttpClient, HttpParams} from '@angular/common/http';
  import {CreateReservationProductDTO} from '../shared/dto/reservations/CreateReservationProductDTO.model';
  import {CreateReservationServiceDTO} from '../shared/dto/reservations/CreateReservationServiceDTO.model';


  @Injectable({
    providedIn: 'root'
  })
  export class ReservationService {

    constructor(private HttpClient: HttpClient) { }

    buyProduct(reservation: CreateReservationProductDTO): Observable<unknown> {
      return this.HttpClient.post(environment.apiHost + '/reservations/products', reservation);
    }

    bookService(reservation: CreateReservationServiceDTO): Observable<any> {
      return this.HttpClient.post(environment.apiHost + '/reservations/services', reservation);
    }

    getAvailableTerms(id: string, date: string): Observable<any> {
      let params = new HttpParams();
      params = params.set('date', date);
      return this.HttpClient.get(environment.apiHost + '/reservations/services/' + id + '/terms/' , {params})
    }

  }
