"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Supervisor } from "@/types/supervisor"
import { Badge } from "../ui/badge"
import { DataTableRowActions } from "./data-table-row-actions"

interface SupervisorsDataTableProps {
  supervisors: Supervisor[]
}

export function SupervisorsDataTable({ supervisors }: SupervisorsDataTableProps) {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supervisors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No supervisors found.
                </TableCell>
              </TableRow>
            ) : (
              supervisors.map((supervisor) => (
                <TableRow key={supervisor.id}>
                  <TableCell>{supervisor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{supervisor.location}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={supervisor.status === "active" ? "default" : "secondary"}>
                      {supervisor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DataTableRowActions row={supervisor} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
