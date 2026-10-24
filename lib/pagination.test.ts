import { buildListQuery } from './pagination';

describe('buildListQuery', () => {
  it('builds a query string from the set values', () => {
    expect(buildListQuery({ page: 2, pageSize: 10, search: 'ana' })).toBe(
      '?page=2&pageSize=10&search=ana',
    );
  });

  it('skips empty values', () => {
    expect(buildListQuery({ page: 1, search: '', classId: undefined })).toBe(
      '?page=1',
    );
    expect(buildListQuery({})).toBe('');
  });

  it('encodes special characters', () => {
    expect(buildListQuery({ search: 'Ana & Ion' })).toBe(
      '?search=Ana+%26+Ion',
    );
  });
});
