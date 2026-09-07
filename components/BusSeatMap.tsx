import { Pressable, Text, View } from 'react-native';

import type { SeatAssignment } from '@/types';

type BusSeatMapProps = {
  seatsMap: SeatAssignment[];
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelectSeat?: (seatNumber: number) => void;
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
}: {
  seat: SeatAssignment | null;
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelectSeat?: (seatNumber: number) => void;
}) {
  if (!seat) {
    return <View className="h-14 w-14" />;
  }

  const occupied = isOccupied(seat);
  const ownSeat =
    currentStudentId !== undefined && seat.studentId === currentStudentId;
  const takenByOther = occupied && !ownSeat;
  const selected = selectedSeat === seat.seatNumber || ownSeat;

  if (takenByOther) {
    return (
      <View className="h-14 w-14 items-center justify-center rounded-xl border border-slate-300 bg-slate-200">
        <Text className="text-xs font-bold text-slate-500">✕</Text>
        <Text className="text-sm font-bold text-slate-600">{seat.seatNumber}</Text>
      </View>
    );
  }

  const body = (
    <View
      className={`h-14 w-14 items-center justify-center rounded-xl border ${
        selected
          ? 'border-brand bg-brand'
          : 'border-slate-200 bg-white'
      }`}>
      <Text
        className={`text-sm font-bold ${
          selected ? 'text-white' : 'text-slate-700'
        }`}>
        {seat.seatNumber}
      </Text>
    </View>
  );

  if (!onSelectSeat) {
    return body;
  }

  return (
    <Pressable onPress={() => onSelectSeat(seat.seatNumber)}>{body}</Pressable>
  );
}

function SeatPair({
  left,
  right,
  selectedSeat,
  currentStudentId,
  onSelectSeat,
}: {
  left: SeatAssignment | null;
  right: SeatAssignment | null;
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelectSeat?: (seatNumber: number) => void;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <SeatSlot
        seat={left}
        selectedSeat={selectedSeat}
        currentStudentId={currentStudentId}
        onSelectSeat={onSelectSeat}
      />
      <SeatSlot
        seat={right}
        selectedSeat={selectedSeat}
        currentStudentId={currentStudentId}
        onSelectSeat={onSelectSeat}
      />
    </View>
  );
}

export function BusSeatMap({
  seatsMap,
  selectedSeat = null,
  currentStudentId,
  onSelectSeat,
}: BusSeatMapProps) {
  const rows = chunkVisualRows(seatsMap);

  return (
    <View className="self-center w-full max-w-sm rounded-t-3xl rounded-b-2xl border border-slate-200 bg-slate-50 px-3 pb-4 pt-3">
      <Text className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Frente
      </Text>
      {rows.map((row, index) => {
        const [leftWindow, leftAisle, rightAisle, rightWindow] = row;
        return (
          <View
            key={`row-${index}`}
            className="mb-2 flex-row items-center justify-between">
            <SeatPair
              left={leftWindow}
              right={leftAisle}
              selectedSeat={selectedSeat}
              currentStudentId={currentStudentId}
              onSelectSeat={onSelectSeat}
            />
            <View className="w-8" />
            <SeatPair
              left={rightAisle}
              right={rightWindow}
              selectedSeat={selectedSeat}
              currentStudentId={currentStudentId}
              onSelectSeat={onSelectSeat}
            />
          </View>
        );
      })}
    </View>
  );
}
