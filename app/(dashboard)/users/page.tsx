import { Metadata } from "next"
import { UsersDataTable } from "@/components/users/users-data-table"

export const metadata: Metadata = {
  title: "Users",
  description: "Manage your users",
}

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10 px-6">
      <UsersDataTable />
    </div>
  )
}
