import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const toStr = (item: unknown): string =>
    typeof item === 'string'
      ? item
      : typeof item === 'number'
        ? String(item)
        : '';
  if (Array.isArray(value)) {
    return value.map((item) => toStr(item).trim()).filter(Boolean);
  }
  return toStr(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export class ListTasksQueryDto {
  /** Incluir tasks fechadas/concluídas. Default: false. */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeClosed?: boolean;

  /** Filtra por IDs de assignees do ClickUp. Aceita CSV: ?assignees=123,456 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  assignees?: string[];

  /** Filtra por status. Aceita CSV: ?statuses=in progress,review */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  statuses?: string[];
}
