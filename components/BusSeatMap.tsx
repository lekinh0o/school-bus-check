import { Image, Pressable, Text, View } from 'react-native';

import type { SeatAssignment, Student } from '@/types';
import type { ExecutionStatus } from '@/types/execution';

type BusSeatMapProps = {
  seatsMap: SeatAssignment[];
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelectSeat?: (seatNumber: number) => void;
  studentsById?: Record<string, Student>;
  executionStatusByStudentId?: Record<string, ExecutionStatus>;
  readOnly?: boolean;
};

function isOccupied(seat: SeatAssignment) {
  return seat.studentId != null && seat.studentId.length > 0;
}

function chunkVisualRows(seats: SeatAssignment[]): (SeatAssignment | null)[][] {
  const ordered = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
  const rows: (SeatAssignment | null)[][] = [];

  for (let i = 0; i < ordered.length; i += 4) {
    const a = ordered[i] ?? null;
    const b = ordered[i + 1] ?? null;
    const c = ordered[i + 2] ?? null;
    const d = ordered[i + 3] ?? null;
    rows.push([a, b, d, c]);
  }

  return rows;
}

function SeatSlot({
  seat,
  selectedSeat,
  currentStudentId,
  onSelectSeat,
  studentsById,
  executionStatusByStudentId,
  readOnly,
}: {
  seat: SeatAssignment | null;
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelectSeat?: (seatNumber: number) => void;
  studentsById?: Record<string, Student>;
  executionStatusByStudentId?: Record<string, ExecutionStatus>;
  readOnly?: boolean;
}) {
  if (!seat) {
    return <View className="h-12 w-12" />;
  }

  const occupied = isOccupied(seat);
  const student =
    occupied && seat.studentId ? studentsById?.[seat.studentId] : undefined;
  const executionStatus = seat.studentId
    ? executionStatusByStudentId?.[seat.studentId]
    : undefined;
  const absent = executionStatus === 'ABSENT';
  const ownSeat =
    currentStudentId !== undefined && seat.studentId === currentStudentId;
  const takenByOther = occupied && !ownSeat && !studentsById;
  const selected = selectedSeat === seat.seatNumber || ownSeat;

  if (studentsById && occupied) {
    const photo = student?.photoUri;
    const body = (
      <View
        className={`h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-4 ${
          absent ? 'border-yellow-400' : 'border-slate-200'
        } bg-slate-200`}>
        {photo ? (
          <Image source={{ uri: photo }} className="h-full w-full" />
        ) : (
          <Text className="text-[10px] font-bold text-slate-600">
            {seat.seatNumber}
          </Text>
        )}
      </View>
    );
    if (!onSelectSeat || readOnly) {
      return body;
    }
    return (
      <Pressable onPress={() => onSelectSeat(seat.seatNumber)}>{body}</Pressable>
    );
  }

  if (takenByOther) {
    return (
      <View className="h-12 w-12 items-center justify-center rounded-xl border border-red-400 bg-red-500">
        <Text className="text-[10px] font-bold text-white">✕</Text>
        <Text className="text-sm font-bold text-white">{seat.seatNumber}</Text>
      </View>
    );
  }

  const body = (
    <View
      className={`h-12 w-12 items-center justify-center rounded-xl border ${
        selected
          ? 'border-brand-dark bg-brand'
          : 'border-emerald-500 bg-emerald-500'
      }`}>
      <Text className="text-sm font-bold text-white">{seat.seatNumber}</Text>
    </View>
  );

  if (!onSelectSeat || readOnly) {
    return body;
  }

  return <Pressable onPress={() => onSelectSeat(seat.seatNumber)}>{body}</Pressable>;
}

function SeatPair({
  left,
  right,
  selectedSeat,
  currentStudentId,
  onSelectSeat,
  studentsById,
  executionStatusByStudentId,
  readOnly,
}: {
  left: SeatAssignment | null;
  right: SeatAssignment | null;
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelectSeat?: (seatNumber: number) => void;
  studentsById?: Record<string, Student>;
  executionStatusByStudentId?: Record<string, ExecutionStatus>;
  readOnly?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <SeatSlot
        seat={left}
        selectedSeat={selectedSeat}
        currentStudentId={currentStudentId}
        onSelectSeat={onSelectSeat}
        studentsById={studentsById}
        executionStatusByStudentId={executionStatusByStudentId}
        readOnly={readOnly}
      />
      <SeatSlot
        seat={right}
        selectedSeat={selectedSeat}
        currentStudentId={currentStudentId}
        onSelectSeat={onSelectSeat}
        studentsById={studentsById}
        executionStatusByStudentId={executionStatusByStudentId}
        readOnly={readOnly}
      />
    </View>
  );
}

export function BusSeatMap({
  seatsMap,
  selectedSeat = null,
  currentStudentId,
  onSelectSeat,
  studentsById,
  executionStatusByStudentId,
  readOnly,
}: BusSeatMapProps) {
  const rows = chunkVisualRows(seatsMap);

  return (
    <View className="self-center w-full max-w-sm rounded-t-3xl rounded-b-2xl border border-slate-200 bg-white px-3 pb-3 pt-3">
      <Text className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Frente
      </Text>
      {rows.map((row, index) => {
        const [leftWindow, leftAisle, rightAisle, rightWindow] = row;
        return (
          <View
            key={`row-${index}`}
            className="mb-1.5 flex-row items-center justify-between">
            <SeatPair
              left={leftWindow}
              right={leftAisle}
              selectedSeat={selectedSeat}
              currentStudentId={currentStudentId}
              onSelectSeat={onSelectSeat}
              studentsById={studentsById}
              executionStatusByStudentId={executionStatusByStudentId}
              readOnly={readOnly}
            />
            <View className="w-6" />
            <SeatPair
              left={rightAisle}
              right={rightWindow}
              selectedSeat={selectedSeat}
              currentStudentId={currentStudentId}
              onSelectSeat={onSelectSeat}
              studentsById={studentsById}
              executionStatusByStudentId={executionStatusByStudentId}
              readOnly={readOnly}
            />
          </View>
        );
      })}
      <View className="mt-2 flex-row justify-center gap-4">
        {studentsById ? (
          <View className="flex-row items-center gap-1.5">
            <View className="h-3 w-3 rounded-sm border-2 border-yellow-400 bg-white" />
            <Text className="text-xs text-slate-600">Ausente</Text>
          </View>
        ) : (
          <>
            <View className="flex-row items-center gap-1.5">
              <View className="h-3 w-3 rounded-sm bg-emerald-500" />
              <Text className="text-xs text-slate-600">Livre</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-3 w-3 rounded-sm bg-red-500" />
              <Text className="text-xs text-slate-600">Ocupado</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-3 w-3 rounded-sm bg-brand" />
              <Text className="text-xs text-slate-600">Selecionado</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
