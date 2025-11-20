/**
 * Application-wide enums and constants
 * These MUST match the backend exactly
 */

// User Roles (matches backend SQL User model)
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  VERIFIER: 'verifier',
};

// Document Workflow Status (matches backend MongoDB DocumentVersion model)
export const WORKFLOW_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REVOKED: 'REVOKED',
};

// Audit Log Actions (matches backend)
export const AUDIT_ACTIONS = {
  UPLOAD: 'UPLOAD',
  APPROVE: 'APPROVE',
  REVOKE: 'REVOKE',
  VERIFIED: 'VERIFIED',
};

// Badge tone mappings
export const STATUS_BADGE_TONES = {
  [WORKFLOW_STATUS.APPROVED]: 'success',
  [WORKFLOW_STATUS.PENDING]: 'warning',
  [WORKFLOW_STATUS.REVOKED]: 'error',
};

export const ROLE_BADGE_TONES = {
  [USER_ROLES.SUPERADMIN]: 'error',
  [USER_ROLES.ADMIN]: 'warning',
  [USER_ROLES.VERIFIER]: 'info',
};

export default {
  USER_ROLES,
  WORKFLOW_STATUS,
  AUDIT_ACTIONS,
  STATUS_BADGE_TONES,
  ROLE_BADGE_TONES,
};
