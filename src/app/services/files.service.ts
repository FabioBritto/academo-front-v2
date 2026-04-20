import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { FileDTO } from '../model/files.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(private readonly http: HttpClient) {}

  uploadFile(subjectId: number, file: File): Observable<FileDTO> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileDTO>(`${API_BASE_URL}/files/upload-file/${subjectId}`, formData);
  }

  downloadFile(fileUUID: string): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/files/download/${fileUUID}`, {
      responseType: 'blob'
    });
  }

  deleteFile(uuid: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/files/delete/${uuid}`);
  }

  listBySubjectPaged(subjectId: number, pageRequest?: PageRequest): Observable<Page<FileDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<FileDTO>>(`${API_BASE_URL}/files/${subjectId}`, { params });
  }
}
