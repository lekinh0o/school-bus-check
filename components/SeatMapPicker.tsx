import { Pressable, Text, View } from 'react-native';

type SeatMapPickerProps = {
  seatsMap: { seatNumber: number; studentId: string | null }[];
  selectedSeat?: number | null;
  currentStudentId?: string;
  onSelect?: (seatNumber: number) => void;
};

function OccupiedSeat({ seatNumber }: { seatNumber: number }) {
  return (
    <View
      className="h-14 w-14 items-center justify-center rounded-xl border border-red-200 bg-red-100">
      <Text className="text-sm font-bold text-red-700">{seatNumber}</Text>
    </View>
  );
}

function FreeSeat({ seatNumber }: { seatNumber: number }) {
  return (
    <View className="h-14 w-14 items-center justify-center rounded-xl border border-brand bg-brand-light">
      <Text className="text-sm font-bold text-brand-dark">{seatNumber}</Text>
    </View>
  );
}

export function SeatMapPicker({
  seatsMap,
  selectedSeat = null,
  currentStudentId,
  onSelect,
}: SeatMapPickerProps) {
  return (
    <View className="flex-row flex-wrap justify-center gap-2">
      {seatsMap.map((seat) => {
        const occupied = seat.studentId != null && seat.studentId.length > 0;

        if (!onSelect) {
          return occupied ? (
            <OccupiedSeat key={seat.seatNumber} seatNumber={seat.seatNumber} />
          ) : (
            <FreeSeat key={seat.seatNumber} seatNumber={seat.seatNumber} />
          );
        }

        const takenByOther = occupied && seat.studentId !== currentStudentId;
        const selected = selectedSeat === seat.seatNumber;
        const ownSeat =
          currentStudentId !== undefined && seat.studentId === currentStudentId;

        if (takenByOther) {
          return (
            <OccupiedSeat key={seat.seatNumber} seatNumber={seat.seatNumber} />
          );
        }

        return (
          <Pressable
            key={seat.seatNumber}
            onPress={() => onSelect(seat.seatNumber)}
            className={`h-14 w-14 items-center justify-center rounded-xl border ${
              selected || ownSeat
                ? 'border-brand bg-brand'
                : 'border-brand bg-brand-light'
            }`}>
            <Text
              className={`text-sm font-bold ${
                selected || ownSeat ? 'text-white' : 'text-brand-dark'
              }`}>
              {seat.seatNumber}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
