// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4
import { DadosPressao } from '../models/dados-pressao.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000'; // Replace with your server URL

  constructor(private http: HttpClient) {}

  getData(): Observable<DadosPressao[]> {
    return this.http.get<DadosPressao[]>(this.apiUrl);
  }

  addData(newData: Omit<DadosPressao, 'id'>): Observable<DadosPressao> {
    const dataWithId: DadosPressao = {
      id: uuidv4(),
      ...newData,
    };

    return this.http.post<DadosPressao>(this.apiUrl, dataWithId);
  }

  updateData(id: string, updatedData: DadosPressao): Observable<DadosPressao> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<DadosPressao>(url, updatedData);
  }

  deleteData(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url);
  }
}
