export type ExcelEntityKind = 'vehicles' | 'schools' | 'routes' | 'students';

export type ColumnDef = {
  key: string;
  label: string;
  aliases: string[];
  required: boolean;
};

export const SHEET_TITLES: Record<ExcelEntityKind, string> = {
  vehicles: 'Veículos',
  schools: 'Escolas',
  routes: 'Rotas',
  students: 'Alunos',
};

export const VEHICLE_COLUMNS: ColumnDef[] = [
  { key: 'plate', label: 'Placa', aliases: ['placa'], required: true },
  {
    key: 'responsible',
    label: 'Responsável',
    aliases: ['responsavel', 'responsável'],
    required: true,
  },
  {
    key: 'totalSeats',
    label: 'Quantidade de assentos',
    aliases: ['quantidade de assentos', 'assentos'],
    required: true,
  },
];

export const SCHOOL_COLUMNS: ColumnDef[] = [
  { key: 'registry', label: 'Registro', aliases: ['registro'], required: false },
  { key: 'name', label: 'Nome', aliases: ['nome'], required: true },
  {
    key: 'address',
    label: 'Endereço',
    aliases: ['endereco', 'endereço'],
    required: false,
  },
  {
    key: 'principal',
    label: 'Responsável/Direção',
    aliases: [
      'responsavel/direcao',
      'responsável/direção',
      'diretor',
      'diretora',
      'direção',
    ],
    required: false,
  },
  { key: 'phone', label: 'Telefone', aliases: ['telefone'], required: false },
  { key: 'latitude', label: 'Latitude', aliases: ['latitude'], required: false },
  {
    key: 'longitude',
    label: 'Longitude',
    aliases: ['longitude'],
    required: false,
  },
];

export const ROUTE_COLUMNS: ColumnDef[] = [
  { key: 'title', label: 'Título', aliases: ['titulo', 'título'], required: true },
  { key: 'school', label: 'Escola', aliases: ['escola'], required: true },
  {
    key: 'responsible',
    label: 'Responsável',
    aliases: ['responsavel', 'responsável'],
    required: true,
  },
  { key: 'monitor', label: 'Monitor', aliases: ['monitor'], required: true },
  {
    key: 'startPoint',
    label: 'Ponto de início',
    aliases: ['ponto de inicio', 'ponto de início'],
    required: true,
  },
  {
    key: 'departureTimeIda',
    label: 'Horário início ida',
    aliases: ['horario inicio ida', 'horário início ida'],
    required: true,
  },
  {
    key: 'arrivalTimeIda',
    label: 'Horário término ida',
    aliases: ['horario termino ida', 'horário término ida'],
    required: true,
  },
  {
    key: 'departureTimeVolta',
    label: 'Horário início volta',
    aliases: ['horario inicio volta', 'horário início volta'],
    required: true,
  },
  {
    key: 'arrivalTimeVolta',
    label: 'Horário término volta',
    aliases: ['horario termino volta', 'horário término volta'],
    required: true,
  },
  {
    key: 'period',
    label: 'Período',
    aliases: ['periodo', 'período'],
    required: true,
  },
  {
    key: 'operationType',
    label: 'Tipo de operação',
    aliases: ['tipo de operacao', 'tipo de operação'],
    required: true,
  },
  {
    key: 'boardingPoints',
    label: 'Pontos de embarque',
    aliases: ['pontos de embarque'],
    required: false,
  },
];

export const STUDENT_COLUMNS: ColumnDef[] = [
  {
    key: 'enrollmentCode',
    label: 'Carteirinha / Matrícula',
    aliases: [
      'carteirinha / matricula',
      'carteirinha / matrícula',
      'carteirinha',
      'matricula',
      'matrícula',
    ],
    required: false,
  },
  { key: 'name', label: 'Nome', aliases: ['nome'], required: true },
  { key: 'age', label: 'Idade', aliases: ['idade'], required: false },
  {
    key: 'responsible',
    label: 'Responsável',
    aliases: ['responsavel', 'responsável'],
    required: false,
  },
  {
    key: 'phone1',
    label: 'Telefone 1',
    aliases: ['telefone 1', 'telefone1'],
    required: false,
  },
  {
    key: 'phone2',
    label: 'Telefone 2',
    aliases: ['telefone 2', 'telefone2'],
    required: false,
  },
  { key: 'grade', label: 'Série', aliases: ['serie', 'série'], required: false },
  { key: 'school', label: 'Escola', aliases: ['escola'], required: true },
  { key: 'route', label: 'Rota', aliases: ['rota'], required: true },
  {
    key: 'boardingPoint',
    label: 'Ponto de embarque',
    aliases: ['ponto de embarque'],
    required: true,
  },
  {
    key: 'vehicle',
    label: 'Veículo',
    aliases: ['veiculo', 'veículo'],
    required: true,
  },
  { key: 'seatNumber', label: 'Assento', aliases: ['assento'], required: true },
];

export const COLUMNS_BY_KIND: Record<ExcelEntityKind, ColumnDef[]> = {
  vehicles: VEHICLE_COLUMNS,
  schools: SCHOOL_COLUMNS,
  routes: ROUTE_COLUMNS,
  students: STUDENT_COLUMNS,
};

export function foldHeader(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function matchSheetKind(name: string): ExcelEntityKind | undefined {
  const folded = foldHeader(name);
  for (const [kind, title] of Object.entries(SHEET_TITLES) as Array<
    [ExcelEntityKind, string]
  >) {
    if (foldHeader(title) === folded) {
      return kind;
    }
  }
  return undefined;
}

export function columnKeyForHeader(
  header: string,
  columns: ColumnDef[],
): string | undefined {
  const folded = foldHeader(header);
  for (const column of columns) {
    const labels = [column.label, ...column.aliases].map(foldHeader);
    if (labels.includes(folded)) {
      return column.key;
    }
  }
  return undefined;
}

export function requiredColumnKeys(columns: ColumnDef[]): string[] {
  return columns.filter((column) => column.required).map((column) => column.key);
}
