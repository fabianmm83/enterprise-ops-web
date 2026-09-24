export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;         // página actual
  size: number;           // tamaño de página
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: Pageable;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}