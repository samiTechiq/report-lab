"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { userService } from '@/lib/services/user-service'

interface UserContextType {
  users: User[]
  isLoading: boolean
  error: Error | null
  createUser: (input: CreateUserInput) => Promise<User>
  updateUser: (id: string, input: UpdateUserInput) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  refreshUsers: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const fetchedUsers = await userService.getUsers()
      setUsers(fetchedUsers)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const createUser = async (input: CreateUserInput) => {
    const newUser = await userService.createUser(input)
    await fetchUsers() // Refresh the users list
    return newUser
  }

  const updateUser = async (id: string, input: UpdateUserInput) => {
    await userService.updateUser(id, input)
    await fetchUsers() // Refresh the users list
  }

  const deleteUser = async (id: string) => {
    await userService.deleteUser(id)
    await fetchUsers() // Refresh the users list
  }

  const value = {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUsers() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
}
