import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  AfternoonStatus,
  MorningStatus,
  Shift,
  Student,
  StudentAttendance,
} from '@/types/attendance';

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Ana Souza',
    grade: '3º ano',
    pickupAddress: 'Rua das Palmeiras, 120',
  },
  {
    id: '2',
    name: 'Pedro Lima',
    grade: '5º ano',
    pickupAddress: 'Av. Central, 45',
  },
  {
    id: '3',
    name: 'Marina Costa',
    grade: '2º ano',
    pickupAddress: 'Rua do Sol, 88',
  },
];

type AttendanceContextValue = {
  students: Student[];
  attendance: Record<string, StudentAttendance>;
  shift: Shift;
  setShift: (shift: Shift) => void;
  setMorningStatus: (studentId: string, status: MorningStatus) => void;
  setAfternoonStatus: (studentId: string, status: AfternoonStatus) => void;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [shift, setShift] = useState<Shift>('morning');
  const [attendance, setAttendance] = useState<Record<string, StudentAttendance>>(
    {},
  );

  const setMorningStatus = useCallback((studentId: string, status: MorningStatus) => {
    setAttendance((current) => ({
      ...current,
      [studentId]: { ...current[studentId], studentId, morning: status },
    }));
  }, []);

  const setAfternoonStatus = useCallback(
    (studentId: string, status: AfternoonStatus) => {
      setAttendance((current) => ({
        ...current,
        [studentId]: { ...current[studentId], studentId, afternoon: status },
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      students: MOCK_STUDENTS,
      attendance,
      shift,
      setShift,
      setMorningStatus,
      setAfternoonStatus,
    }),
    [attendance, shift, setMorningStatus, setAfternoonStatus],
  );

  return (
    <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance deve ser usado dentro de AttendanceProvider');
  }
  return context;
}
