"use client"
import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Report } from "@/types"
import { reportService } from "@/lib/report-service"
import { useAuth } from "@/context/auth-context"
import { CreateReportDialog } from "@/components/reports/create-report-dialog"
import { EditReportDialog } from "@/components/reports/edit-report-dialog"
import { UploadReportDialog } from "@/components/reports/upload-report-dialog"
import { useQuery } from "@tanstack/react-query"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { formatNumber, subStr } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { FilterReportsDialog } from "@/components/reports/filter-reports-dialog"
import { exportReportsToCSV } from "@/lib/csv-utils"

const ITEMS_PER_PAGE = 10

export function ReportsDataTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
  })
  const [lastDocHistory, setLastDocHistory] = useState<any[]>([null])
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuth()

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["reports", currentPage, filters],
    queryFn: async () => {
      // Reset pagination when filters change
      const currentLastDoc = currentPage === 1 ? null : lastDocHistory[currentPage - 1];
      
      const result = await reportService.getReports({
        pageSize: ITEMS_PER_PAGE,
        lastDoc: currentLastDoc,
        filters: filters.location ? { location: filters.location.trim() } : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      });
      
      if (currentPage === lastDocHistory.length) {
        setLastDocHistory(prev => [...prev, result.lastDoc]);
      }
      
      setHasMore(result.reports.length === ITEMS_PER_PAGE);
      return result;
    },
    staleTime: Infinity,
    placeholderData: (previousData) => previousData
  })

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleFilter = (newFilters: {
    startDate: string
    endDate: string
    location: string
  }) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setLastDocHistory([null]);
    setHasMore(true);
  };

  const handleExportCSV = async () => {
    try {
      // Get all filtered reports for export
      const reports = await reportService.getAllFilteredReports({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      });

      exportReportsToCSV(reports);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // You might want to add proper error handling/notification here
    }
  };

  if (error) {
    console.error('Error loading reports:', error);
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error Loading Reports</h3>
          <p className="text-sm text-muted-foreground">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </div>
    )
  }

  const filteredReports = useMemo(() => 
    (data?.reports || []).filter((report) =>
      report.location?.toLowerCase().includes(filters.location.toLowerCase())
    ),
    [data?.reports, filters.location]
  );

  const ReportCard = ({ report }: { report: Report }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Header information */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="font-semibold text-base">
                {new Date(report.report_date).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {report.location}
              </div>
            </div>
            <EditReportDialog report={report} />
          </div>

          {/* KG Information */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">KG Information</div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Opening:</span>
                <span className="ml-2">{formatNumber(report.opening_kg)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Additional:</span>
                <span className="ml-2">{formatNumber(report.additional_kg)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Used:</span>
                <span className="ml-2">{formatNumber(report.kg_used)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Closing:</span>
                <span className="ml-2">{formatNumber(report.closing_kg)}</span>
              </div>
          </div>

          {/* Bag Information */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Bag Information</div>
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Opening:</span>
                <span className="ml-2">{formatNumber(report.opening_bag)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Produced:</span>
                <span className="ml-2">{formatNumber(report.bag_produced)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Sold:</span>
                <span className="ml-2">{formatNumber(report.bag_sold)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Closing:</span>
                <span className="ml-2">{formatNumber(report.closing_bag)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Missing:</span>
                <span className="ml-2">{formatNumber(report.missing_bag)}</span>
              </div>
          </div>

          {/* Footer information */}
          <div className="text-sm text-muted-foreground">
            Recorded by {subStr(report.recorded_by, 25)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="px-4 md:px-8">
      <div className="flex flex-row md:items-center py-4 gap-2 justify-between">
       <div className="flex flex-row items-center gap-2">
       <FilterReportsDialog onFilter={handleFilter} />
        {(filters.location || filters.startDate || filters.endDate) && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportCSV}
              title="Export filtered reports to CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
           
          </div>
        )}
        <div className="hidden md:block"><UploadReportDialog /></div>
       </div>
        <CreateReportDialog />
      
      </div>

      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Date</TableHead>
              <TableHead>Opening KG</TableHead>
              <TableHead>Additional KG</TableHead>
              <TableHead>KG Used</TableHead>
              <TableHead>Closing KG</TableHead>
              <TableHead>Opening Bag</TableHead>
              <TableHead>Bag Produced</TableHead>
              <TableHead>Bag Sold</TableHead>
              <TableHead>Closing Bag</TableHead>
              <TableHead>Missing Bag</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Report By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center">
                  <Spinner className="mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatNumber(report.opening_kg)}</TableCell>
                  <TableCell>{formatNumber(report.additional_kg)}</TableCell>
                  <TableCell>{formatNumber(report.kg_used)}</TableCell>
                  <TableCell>{formatNumber(report.closing_kg)}</TableCell>
                  <TableCell>{formatNumber(report.opening_bag)}</TableCell>
                  <TableCell>{formatNumber(report.bag_produced)}</TableCell>
                  <TableCell>{formatNumber(report.bag_sold)}</TableCell>
                  <TableCell>{formatNumber(report.closing_bag)}</TableCell>
                  <TableCell>{formatNumber(report.missing_bag)}</TableCell>
                  <TableCell>{subStr(report.location, 10)}</TableCell>
                  <TableCell>{subStr(report.recorded_by, 12)}</TableCell>
                  <TableCell>
                    <EditReportDialog report={report} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <Spinner className="mx-auto" />
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <div className="text-center py-8">No reports found.</div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!hasMore || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
