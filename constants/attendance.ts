import type {
  AfternoonStatus,
  AttendanceStatus,
  MorningStatus,
  Shift,
} from '@/types/attendance';

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: 'Manhã (Ida)',
  afternoon: 'Tarde (Volta)',
};

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  boarding_home: 'Ida (Ingresso)',
  absent_morning: 'Ida (Ausente)',
  school_dropoff: 'Escola (Desembarque)',
  boarding_school: 'Volta (Ingresso)',
  absent_afternoon: 'Volta (Ausente)',
  home_dropoff: 'Volta (Desembarque)',
};

export const STATUS_HINTS: Record<AttendanceStatus, string> = {
  boarding_home: 'Aluno entrou na van na porta de casa.',
  absent_morning: 'Aluno não vai de van hoje (aviso prévio).',
  school_dropoff: 'Aluno entregue e entrou na escola em segurança.',
  boarding_school: 'Aluno entrou na van na saída da escola.',
  absent_afternoon: 'Aluno volta por outros meios (ex.: pais buscaram).',
  home_dropoff: 'Aluno entregue em segurança no destino/casa.',
};

export const MORNING_STATUSES: MorningStatus[] = [
  'boarding_home',
  'absent_morning',
  'school_dropoff',
];

export const AFTERNOON_STATUSES: AfternoonStatus[] = [
  'boarding_school',
  'absent_afternoon',
  'home_dropoff',
];

export const STATUS_STYLES: Record<AttendanceStatus, string> = {
  boarding_home: 'bg-boarding',
  absent_morning: 'bg-absent',
  school_dropoff: 'bg-dropoff',
  boarding_school: 'bg-boarding',
  absent_afternoon: 'bg-absent',
  home_dropoff: 'bg-dropoff',
};
