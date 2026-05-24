import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  uploadFile(file: File) {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/upload`,
      formData
    );
  }

  analyseFile(filename: string) {

    return this.http.get(
      `${this.baseUrl}/analyse/${filename}`
    );
  }
}