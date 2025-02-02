import { Metadata } from "next"
import { ReportsDataTable } from "@/components/reports/reports-data-table"

export const metadata: Metadata = {
  title: "Reports",
  description: "Manage your reports",
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-10">
      <ReportsDataTable />
    </div>
  )
}
