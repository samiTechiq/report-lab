"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Report } from "@/types/report"
import { BarChart3 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"

interface ReportAggregationDialogProps {
  reports: Report[]
  startDate?: string
  endDate?: string
}

interface AggregatedData {
  location: string
  totalKgUsed: number
  totalBagProduced: number
  totalBagSold: number
  totalMissingBag: number
  count: number
}

export function ReportAggregationDialog({ reports, startDate, endDate }: ReportAggregationDialogProps) {
  // Aggregate data by location
  const aggregatedData = reports.reduce((acc: { [key: string]: AggregatedData }, report) => {
    const location = report.location || "Unknown"
    
    if (!acc[location]) {
      acc[location] = {
        location,
        totalKgUsed: 0,
        totalBagProduced: 0,
        totalBagSold: 0,
        totalMissingBag: 0,
        count: 0
      }
    }
    
    acc[location].totalKgUsed += parseFloat(report.kg_used?.toString() || "0")
    acc[location].totalBagProduced += parseInt(report.bag_produced?.toString() || "0", 10)
    acc[location].totalBagSold += parseInt(report.bag_sold?.toString() || "0", 10)
    acc[location].totalMissingBag += parseInt(report.missing_bag?.toString() || "0", 10)
    acc[location].count++
    
    return acc
  }, {})

  const aggregatedArray = Object.values(aggregatedData)

  // Calculate totals for all locations
  const totals = aggregatedArray.reduce((acc, curr) => ({
    totalKgUsed: acc.totalKgUsed + curr.totalKgUsed,
    totalBagProduced: acc.totalBagProduced + curr.totalBagProduced,
    totalBagSold: acc.totalBagSold + curr.totalBagSold,
    totalMissingBag: acc.totalMissingBag + curr.totalMissingBag,
    count: acc.count + curr.count
  }), {
    totalKgUsed: 0,
    totalBagProduced: 0,
    totalBagSold: 0,
    totalMissingBag: 0,
    count: 0
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="View Aggregated Report">
          <BarChart3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggregated Report Analysis</DialogTitle>
          <DialogDescription>
            {startDate && endDate ? (
              `Summary of reports from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
            ) : startDate ? (
              `Summary of reports from ${new Date(startDate).toLocaleDateString()} onwards`
            ) : endDate ? (
              `Summary of reports up to ${new Date(endDate).toLocaleDateString()}`
            ) : (
              "Summary of all reports"
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Total KG Used</TableHead>
                <TableHead>Total Bag Produced</TableHead>
                <TableHead>Total Bag Sold</TableHead>
                <TableHead>Total Missing Bags</TableHead>
                <TableHead>Number of Reports</TableHead>
                <TableHead>Each KG Produced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedArray.map((data) => (
                <TableRow key={data.location}>
                  <TableCell>{data.location}</TableCell>
                  <TableCell>{formatNumber(data.totalKgUsed)}</TableCell>
                  <TableCell>{formatNumber(data.totalBagProduced)}</TableCell>
                  <TableCell>{formatNumber(data.totalBagSold)}</TableCell>
                  <TableCell>{formatNumber(data.totalMissingBag)}</TableCell>
                  <TableCell>{data.count}</TableCell>
                  <TableCell>
                    {formatNumber(data.totalBagProduced / data.totalKgUsed || 0)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell>{formatNumber(totals.totalKgUsed)}</TableCell>
                <TableCell>{formatNumber(totals.totalBagProduced)}</TableCell>
                <TableCell>{formatNumber(totals.totalBagSold)}</TableCell>
                <TableCell>{formatNumber(totals.totalMissingBag)}</TableCell>
                <TableCell>{totals.count}</TableCell>
                <TableCell>
                  {formatNumber(totals.totalBagProduced / totals.totalKgUsed || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
