export function validateStringField(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a string. Please verify it!`);
  }
  return value as string;
}

export function validateOptionalStringField(value: unknown, fieldName: string): string | undefined {
  if (value === "" || value === undefined) {
    return undefined;
  } else if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string. Please verify it!`);
  }
  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  return trimmed;
}

export function validateDateField(value: unknown, fieldName: string): Date {
  let parsedDate: Date;

  if (typeof value === "string") {
    parsedDate = new Date(value);
  } else if (value instanceof Date) {
    parsedDate = new Date(value);
  } else {
    throw new Error(`${fieldName} has an invalid date format: '${value}'. Please verify it!`);
  }

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} has an invalid date format: '${value}'. Please verify it!`);
  }

  return parsedDate;
}

export function validateNumberField(value: unknown, fieldName: string): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!isNaN(parsed)) return parsed;
  }
  throw new Error(`${fieldName} is required and must a number. Please verify it!`);
}

export function validateOptionalNumberField(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "number") {
    if (isNaN(value)) {
      throw new Error(`${fieldName} must be a valid number.`);
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }

    const parsed = Number(trimmed);
    if (isNaN(parsed)) {
      throw new Error(`${fieldName} must be a valid number. Please verify it!`);
    }
    return parsed;
  }
  throw new Error(`${fieldName} must be a valid number. Please verify it!`);
}

export function validateBooleanField(value: unknown, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }

  throw new Error(
    `${fieldName} is required and must be a boolean, or a string being 'true' or 'false'. Please verify it!`,
  );
}

export function validateExternalIdField(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a non-empty string. Please verify it!`);
  }

  const trimmed = value.trim();

  if (!isUUID(trimmed)) {
    throw new Error(`${fieldName} has an invalid format. Please verify it!`);
  }

  return trimmed;
}

export function validateComparativeField(value: unknown, validatedValue: unknown, fieldName: string): boolean {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a string. Please verify it!`);
  }
  if (typeof validatedValue !== "string" || !validatedValue.trim()) {
    throw new Error(`${fieldName} is required and must be a string. Please verify it!`);
  }
  if (value !== validatedValue) {
    throw new Error(`${fieldName} does not match the expected value. Please verify it!`);
  }

  return true;
}

export function validateTime(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a string in HH:mm format.`);
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(value)) {
    throw new Error(`${fieldName} must be in HH:mm format (00:00 to 23:59).`);
  }
  return value;
}

export function validateTokenField(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a non-empty string. Please verify it!`);
  }

  const trimmed = value.trim();

  const TOKEN_REGEX = /^[a-f0-9]{64}$/;
  if (!TOKEN_REGEX.test(trimmed)) {
    throw new Error(`${fieldName} has an invalid format. Please verify it!`);
  }

  return trimmed;
}

function isUUID(value: string): boolean {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(value);
}

export function validateArrayField(value: unknown, fieldName: string) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty array.`);
  }
  return value as Array<unknown>;
}
