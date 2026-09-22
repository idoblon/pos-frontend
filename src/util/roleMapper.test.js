import { describe, it, expect } from 'vitest';
import {
  getDisplayRole,
  mapToBackendRole,
  hasPermission,
  getAllowedRoutes,
} from './roleMapper';

describe('getDisplayRole', () => {
  it('maps every backend role including ROLE_STORE_MANAGER', () => {
    expect(getDisplayRole('ROLE_ADMIN')).toBe('Super Admin');
    expect(getDisplayRole('ROLE_STORE_ADMIN')).toBe('Store Admin');
    expect(getDisplayRole('ROLE_STORE_MANAGER')).toBe('Store Manager');
    expect(getDisplayRole('ROLE_BRANCH_MANAGER')).toBe('Branch Manager');
    expect(getDisplayRole('ROLE_BRANCH_CASHIER')).toBe('Cashier');
  });

  it('passes unknown roles through unchanged', () => {
    expect(getDisplayRole('ROLE_SOMETHING_NEW')).toBe('ROLE_SOMETHING_NEW');
  });
});

describe('mapToBackendRole', () => {
  it('maps frontend keys to backend roles', () => {
    expect(mapToBackendRole('store_manager')).toBe('ROLE_STORE_MANAGER');
    expect(mapToBackendRole('admin')).toBe('ROLE_ADMIN');
  });

  it('passes backend-style roles through unchanged', () => {
    expect(mapToBackendRole('ROLE_ADMIN')).toBe('ROLE_ADMIN');
  });
});

describe('hasPermission', () => {
  it('grants higher roles access to lower-role routes', () => {
    expect(hasPermission('ROLE_ADMIN', ['ROLE_BRANCH_CASHIER'])).toBe(true);
    expect(hasPermission('ROLE_STORE_ADMIN', ['ROLE_BRANCH_MANAGER'])).toBe(true);
  });

  it('denies lower roles access to higher-role routes', () => {
    expect(hasPermission('ROLE_BRANCH_CASHIER', ['ROLE_ADMIN'])).toBe(false);
    expect(hasPermission('ROLE_STORE_MANAGER', ['ROLE_ADMIN'])).toBe(false);
  });

  it('handles ROLE_STORE_MANAGER in the hierarchy', () => {
    expect(hasPermission('ROLE_STORE_MANAGER', ['ROLE_STORE_MANAGER'])).toBe(true);
    expect(hasPermission('ROLE_STORE_MANAGER', ['ROLE_BRANCH_MANAGER'])).toBe(true);
    expect(hasPermission('ROLE_STORE_MANAGER', ['ROLE_STORE_ADMIN'])).toBe(false);
    expect(hasPermission('ROLE_ADMIN', ['ROLE_STORE_MANAGER'])).toBe(true);
  });

  it('fails closed for unknown roles', () => {
    expect(hasPermission('ROLE_HACKER', ['ROLE_USER'])).toBe(false);
    expect(hasPermission(undefined, ['ROLE_USER'])).toBe(false);
    expect(hasPermission(null, ['ROLE_ADMIN'])).toBe(false);
  });

  it('fails closed when none of the required roles are known', () => {
    expect(hasPermission('ROLE_ADMIN', ['ROLE_NOT_A_ROLE'])).toBe(false);
  });
});

describe('getAllowedRoutes', () => {
  it('returns routes for known roles', () => {
    expect(getAllowedRoutes('ROLE_STORE_MANAGER')).toContain('/store-admin');
    expect(getAllowedRoutes('ROLE_BRANCH_CASHIER')).toEqual(['/cashier']);
  });

  it('returns an empty list (deny) for unknown roles', () => {
    expect(getAllowedRoutes('ROLE_HACKER')).toEqual([]);
    expect(getAllowedRoutes(undefined)).toEqual([]);
  });
});
