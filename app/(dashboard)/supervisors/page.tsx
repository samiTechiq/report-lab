"use client"

import { SupervisorsDataTable } from "@/components/supervisors/supervisors-data-table"
import { CreateSupervisorDialog } from "@/components/supervisors/create-supervisor-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supervisorService } from "@/lib/services/supervisor-service"
import { SupervisorProvider } from "@/context/supervisor-context"

export default function SupervisorsPage() {
  const queryClient = useQueryClient()

  const { data: supervisors, isLoading } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      try {
        const supervisors = await supervisorService.getSupervisors()
        return supervisors
      } catch (error) {
        console.error('Error fetching supervisors:', error)
        throw error
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  return (
    <SupervisorProvider>
      <div className="flex flex-col gap-4 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Supervisors</h2>
            <p className="text-muted-foreground">
              Manage your supervisors and their locations
            </p>
          </div>
          <CreateSupervisorDialog />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-[250px]" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        ) : (
          <SupervisorsDataTable supervisors={supervisors || []} />
        )}
      </div>
    </SupervisorProvider>
  )
}
