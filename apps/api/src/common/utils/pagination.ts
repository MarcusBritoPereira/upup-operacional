export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export function normalizePagination(query?: PaginationQuery) {
  const pageRaw = query?.page ? Number(query.page) : DEFAULT_PAGE;
  const limitRaw = query?.limit ? Number(query.limit) : DEFAULT_LIMIT;
  
  const page = Math.max(1, Math.trunc(isNaN(pageRaw) ? DEFAULT_PAGE : pageRaw));
  const requestedLimit = Math.trunc(isNaN(limitRaw) ? DEFAULT_LIMIT : limitRaw);
  const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
