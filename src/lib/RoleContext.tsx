'use client'

import { createContext, useContext, type ReactNode } from 'react'

type Role = 'admin' | 'team_manager' | 'logistics' | 'team_member'

interface RoleContextType {
  role: Role
  isAdmin:       boolean   // admin
  isManager:     boolean   // admin | team_manager
  canEdit:       boolean   // admin | team_manager | logistics
  isTeamMember:  boolean   // team_member (read-only)
}

const RoleContext = createContext<RoleContextType>({
  role:          'team_member',
  isAdmin:       false,
  isManager:     false,
  canEdit:       false,
  isTeamMember:  true,
})

export function RoleProvider({ role, children }: { role: Role; children: ReactNode }) {
  const value: RoleContextType = {
    role,
    isAdmin:      role === 'admin',
    isManager:    ['admin', 'team_manager'].includes(role),
    canEdit:      ['admin', 'team_manager', 'logistics'].includes(role),
    isTeamMember: role === 'team_member',
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
