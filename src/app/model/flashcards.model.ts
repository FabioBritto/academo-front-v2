export type CardLevel = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'MUITO_DIFICIL' | 'SEM_NIVEL';

export interface CreateFlashcardDTO {
  subjectId: number;
  frontPart: string;
  backPart: string;
}

export interface UpdateFlashcardDTO {
  level: CardLevel;
  frontPart: string;
  backPart: string;
}

export interface UpdateLevelDTO {
  level: CardLevel;
}

export interface FlashcardDTO {
  id: number;
  subjectId: number;
  level: CardLevel;
  frontPart: string;
  backPart: string;
  createdAt: string;
  updatedAt: string;
}
