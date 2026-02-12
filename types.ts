
export enum AppointmentStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  REMARCAR = 'REMARCAR',
  REALIZADO = 'REALIZADO'
}

export interface Appointment {
  id: string;
  studentName: string;
  whatsapp?: string;
  dateTime: Date;
  sessionType: 'Avaliação' | 'Intervenção' | 'Devolutiva';
  status: AppointmentStatus;
  confirmationToken?: string;
  tokenExpiresAt?: Date;
  isViewed?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  registry: string;
  photoUrl: string;
  role: string;
}

export type ThemeColor = 'blue' | 'black' | 'gray' | 'purple' | 'green' | 'red' | 'white';
