export function optionalText(
  value: string | undefined | null,
): string | undefined {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function optionalPhones(
  values: Array<string | undefined | null>,
): string[] | undefined {
  const phones = values
    .map((value) => optionalText(value))
    .filter((value): value is string => value !== undefined);
  return phones.length > 0 ? phones : undefined;
}
