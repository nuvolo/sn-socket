import { SNSocketParams } from './socket';

function getSocketPath(params: SNSocketParams): string {
  const { table, filter } = params;
  return getTablePath(table, filter);
}

function getEncodedFilter(filter: string): string {
  return btoa(filter).replace(/=/g, '-');
}

function getTablePath(table: string, filter: string): string {
  const encoded = getEncodedFilter(filter);
  return `/rw/default/${table}/${encoded}`;
}

export { getSocketPath };
