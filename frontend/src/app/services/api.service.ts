import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://finscope-ai-backend-mdd3.onrender.com';

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