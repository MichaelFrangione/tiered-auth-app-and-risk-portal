import { User, Role } from '@prisma/client'

export function canAccessOrganization(user: User, orgId: string): boolean {
  // Admin can access all organizations
  if (user.role === Role.ADMIN) {
    return true
  }
  
  // Directors and analysts can only access their own organization
  return user.organizationId === orgId
}

export function canViewAllData(user: User): boolean {
  // Only admin and director can view all data
  return user.role === Role.ADMIN || user.role === Role.DIRECTOR
}

export function getVisibleFields(user: User): string[] {
  switch (user.role) {
    case Role.ADMIN:
      return ['id', 'name', 'email', 'role', 'organization', 'submissions', 'createdAt', 'updatedAt']
    case Role.DIRECTOR:
      return ['id', 'name', 'email', 'role', 'organization', 'submissions', 'createdAt', 'updatedAt']
    case Role.ANALYST:
      return ['id', 'name', 'email', 'role', 'createdAt'] // Limited fields for analysts
    default:
      return ['id', 'name', 'email']
  }
}

export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return 'Administrator'
    case Role.DIRECTOR:
      return 'Director'
    case Role.ANALYST:
      return 'Analyst'
    default:
      return 'Unknown'
  }
}
