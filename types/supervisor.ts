export type SupervisorLocation = 'extension' | 'newsite' | 'oldsite';
export type SupervisorStatus = 'active' | 'inactive';

export interface Supervisor {
  id: string;
  name: string;
  location: SupervisorLocation;
  status: SupervisorStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type CreateSupervisorInput = Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSupervisorInput = Partial<Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>>;
