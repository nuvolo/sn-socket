import { SNSocketParams } from './socket';

function getSocketPath(params: SNSocketParams): string {
  const { table, filter } = params;
  return _getPath(table, filter);
}

function _getEncodedFilter(filter: string): string {
  return btoa(filter).replace(/=/g, '-');
}

function _getPath(table: string, filter: string): string {
  const encoded = _getEncodedFilter(filter);
  return `/rw/default/${table}/${encoded}`;
}

export { getSocketPath };
