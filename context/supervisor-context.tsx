"use client"

import React, { createContext, useContext } from 'react'
import { Supervisor, CreateSupervisorInput, UpdateSupervisorInput } from '@/types/supervisor'
import { supervisorService } from '@/lib/services/supervisor-service'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient, useMutation } from '@tanstack/react-query'

interface SupervisorContextType {
  createSupervisor: (input: CreateSupervisorInput) => Promise<Supervisor>
  updateSupervisor: (id: string, input: UpdateSupervisorInput) => Promise<void>
  deleteSupervisor: (id: string) => Promise<void>
}

const SupervisorContext = createContext<SupervisorContextType | undefined>(undefined)

export function SupervisorProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: supervisorService.createSupervisor,
    onMutate: async (newSupervisor) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['supervisors'] })

      // Snapshot the previous value
      const previousSupervisors = queryClient.getQueryData(['supervisors'])

      // Optimistically update to the new value
      queryClient.setQueryData(['supervisors'], (old: Supervisor[] = []) => {
        const optimisticSupervisor = {
          ...newSupervisor,
          id: 'temp-id-' + Date.now(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return [...old, optimisticSupervisor]
      })

      // Return a context object with the snapshotted value
      return { previousSupervisors }
    },
    onError: (err, newSupervisor, context) => {
      queryClient.setQueryData(['supervisors'], context?.previousSupervisors)
      toast({
        title: "Error",
        description: "Failed to create supervisor",
        variant: "destructive",
      })
      console.error('Error creating supervisor:', err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] })
      toast({
        title: "Success",
        description: "Supervisor created successfully",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupervisorInput }) =>
      supervisorService.updateSupervisor(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['supervisors'] })

      const previousSupervisors = queryClient.getQueryData(['supervisors'])

      queryClient.setQueryData(['supervisors'], (old: Supervisor[] = []) => {
        return old.map((supervisor) =>
          supervisor.id === id
            ? { ...supervisor, ...input, updatedAt: new Date() }
            : supervisor
        )
      })

      return { previousSupervisors }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['supervisors'], context?.previousSupervisors)
      toast({
        title: "Error",
        description: "Failed to update supervisor",
        variant: "destructive",
      })
      console.error('Error updating supervisor:', err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] })
      toast({
        title: "Success",
        description: "Supervisor updated successfully",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: supervisorService.deleteSupervisor,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['supervisors'] })

      const previousSupervisors = queryClient.getQueryData(['supervisors'])

      queryClient.setQueryData(['supervisors'], (old: Supervisor[] = []) => {
        return old.filter((supervisor) => supervisor.id !== id)
      })

      return { previousSupervisors }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['supervisors'], context?.previousSupervisors)
      toast({
        title: "Error",
        description: "Failed to delete supervisor",
        variant: "destructive",
      })
      console.error('Error deleting supervisor:', err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] })
      toast({
        title: "Success",
        description: "Supervisor deleted successfully",
      })
    },
  })

  const createSupervisor = async (input: CreateSupervisorInput) => {
    return createMutation.mutateAsync(input)
  }

  const updateSupervisor = async (id: string, input: UpdateSupervisorInput) => {
    await updateMutation.mutateAsync({ id, input })
  }

  const deleteSupervisor = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <SupervisorContext.Provider
      value={{
        createSupervisor,
        updateSupervisor,
        deleteSupervisor,
      }}
    >
      {children}
    </SupervisorContext.Provider>
  )
}

export function useSupervisors() {
  const context = useContext(SupervisorContext)
  if (context === undefined) {
    throw new Error('useSupervisors must be used within a SupervisorProvider')
  }
  return context
}
