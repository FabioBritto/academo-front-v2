import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { CardLevel, CreateFlashcardDTO, FlashcardDTO, UpdateFlashcardDTO, UpdateLevelDTO } from '../model/flashcards.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class FlashcardsService {
  constructor(private readonly http: HttpClient) {}

  listPaged(pageRequest?: PageRequest): Observable<Page<FlashcardDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<FlashcardDTO>>(`${API_BASE_URL}/flashcards`, { params });
  }

  listAllBySubject(subjectId: number): Observable<FlashcardDTO[]> {
    return this.http.get<FlashcardDTO[]>(`${API_BASE_URL}/flashcards/all/${subjectId}`);
  }

  listAllBySubjectAndLevel(subjectId: number, level: CardLevel): Observable<FlashcardDTO[]> {
    return this.http.get<FlashcardDTO[]>(`${API_BASE_URL}/flashcards/all/${subjectId}/${level}`);
  }

  listInGroup(groupId: number, level?: CardLevel): Observable<FlashcardDTO[]> {
    let params = new HttpParams();
    if (level) {
      params = params.set('level', level);
    }
    return this.http.get<FlashcardDTO[]>(`${API_BASE_URL}/flashcards/in-group/${groupId}`, { params });
  }

  getById(flashcardId: number): Observable<FlashcardDTO> {
    return this.http.get<FlashcardDTO>(`${API_BASE_URL}/flashcards/${flashcardId}`);
  }

  create(body: CreateFlashcardDTO): Observable<FlashcardDTO> {
    return this.http.post<FlashcardDTO>(`${API_BASE_URL}/flashcards`, body);
  }

  update(flashcardId: number, body: UpdateFlashcardDTO): Observable<FlashcardDTO> {
    return this.http.put<FlashcardDTO>(`${API_BASE_URL}/flashcards/${flashcardId}`, body);
  }

  patchLevel(flashcardId: number, body: UpdateLevelDTO): Observable<FlashcardDTO> {
    return this.http.patch<FlashcardDTO>(`${API_BASE_URL}/flashcards/${flashcardId}`, body);
  }

  delete(flashcardId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/flashcards/${flashcardId}`);
  }
}
