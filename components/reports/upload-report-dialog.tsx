'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Download, FileText } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/hooks/use-toast"
import { reportService } from "@/lib/report-service"
import Papa from 'papaparse'
import { useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function UploadReportDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    // Parse file for preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Show first 5 rows
      complete: (results) => {
        setPreviewData(results.data as any[])
      },
      error: (error: { message: string }) => {
        toast({
          title: "Error",
          description: "Failed to parse CSV file: " + error.message,
          variant: "destructive",
        })
      }
    })
  }

  const processFile = async () => {
    if (!user?.email || !selectedFile) return

    setIsSubmitting(true)
    try {
      const text = await selectedFile.text()
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const reports = results.data as any[]
          
          // Validate required fields
          const requiredFields = [
            'report_date',
            'opening_kg',
            'additional_kg',
            'kg_used',
            'closing_kg',
            'opening_bag',
            'bag_produced',
            'bag_sold',
            'closing_bag',
            'missing_bag',
            'location'
          ]

          const missingFields = reports.some(report => {
            return requiredFields.some(field => !report[field])
          })

          if (missingFields) {
            toast({
              title: "Error",
              description: "CSV file is missing required fields",
              variant: "destructive",
            })
            return
          }

          try {
            // Process and upload each report
            for (const report of reports) {
              // Convert string numbers to actual numbers
              const numericFields = [
                'opening_kg',
                'additional_kg',
                'kg_used',
                'closing_kg',
                'opening_bag',
                'bag_produced',
                'bag_sold',
                'closing_bag',
                'missing_bag'
              ]
              
              numericFields.forEach(field => {
                report[field] = parseFloat(report[field])
              })

              // Validate and format date
              const dateValue = report.report_date
              let formattedDate: Date | null = null

              // Try different date formats
              if (dateValue) {
                const date = new Date(dateValue)
                if (!isNaN(date.getTime())) {
                  // Set time to 1:00:00 AM UTC+1
                  date.setHours(1, 0, 0, 0)
                  formattedDate = date
                } else {
                  // Try parsing DD/MM/YYYY or DD-MM-YYYY format
                  const parts = dateValue.split(/[/-]/)
                  if (parts.length === 3) {
                    const [day, month, year] = parts
                    const parsedDate = new Date(`${year}-${month}-${day}`)
                    if (!isNaN(parsedDate.getTime())) {
                      parsedDate.setHours(1, 0, 0, 0)
                      formattedDate = parsedDate
                    }
                  }
                }
              }

              if (!formattedDate) {
                throw new Error(`Invalid date format for report: ${dateValue}`)
              }

              // Validate location
              if (!['extension', 'newsite', 'oldsite'].includes(report.location.toLowerCase())) {
                throw new Error(`Invalid location: ${report.location}. Must be extension, newsite, or oldsite.`)
              }

              await reportService.createReport({
                ...report,
                report_date: formattedDate,
                location: report.location.toLowerCase(),
                recorded_by: user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            }

            // Invalidate queries to refetch data
            await queryClient.invalidateQueries({ queryKey: ['reports'] })
            await queryClient.invalidateQueries({ queryKey: ['filtered-reports'] })

            toast({
              title: "Success",
              description: `Successfully uploaded ${reports.length} reports`,
            })
            setOpen(false)
            setSelectedFile(null)
            setPreviewData([])
            
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to process reports",
              variant: "destructive",
            })
          }
        },
        error: (error: { message: string }) => {
          toast({
            title: "Error",
            description: "Failed to parse CSV file: " + error.message,
            variant: "destructive",
          })
        }
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload reports: " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadSample = () => {
    // Get current date formatted as "Month DD, YYYY"
    const today = new Date()
    today.setHours(1, 0, 0, 0) // Set to 1:00:00 AM
    const formattedDate = today.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    
    // Sample data
    const sampleData = {
      report_date: formattedDate,
      opening_kg: "100.00",
      additional_kg: "50.00",
      kg_used: "75.00",
      closing_kg: "75.00",
      opening_bag: "200.00",
      bag_produced: "150.00",
      bag_sold: "100.00",
      closing_bag: "250.00",
      missing_bag: "0.00",
      location: "extension"
    }

    // Convert to CSV
    const csv = Papa.unparse([sampleData], {
      quotes: true,
      delimiter: ","
    })

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `report-sample-${today.toISOString().split('T')[0]}.csv`)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8">
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] md:max-w-[100vw] overflow-y-auto scrollbar-hide h-[100vh] lg:max-w-[1200px] xl:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle>Upload Reports</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing multiple reports. The CSV must include all required fields.
            Dates should be in YYYY-MM-DD format (e.g., 2025-02-02).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadSample}
              className="h-10 whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample
            </Button>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <Button 
                  onClick={processFile} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    'Process CSV'
                  )}
                </Button>
              </div>

              {previewData.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(previewData[0]).map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, i) => (
                            <TableCell key={i}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-3 text-sm text-muted-foreground border-t">
                    Showing preview of first 5 rows
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Required CSV columns:</p>
            <ul className="list-disc list-inside mt-2">
              <li>report_date (Month DD, YYYY)</li>
              <li>opening_kg (number)</li>
              <li>additional_kg (number)</li>
              <li>kg_used (number)</li>
              <li>closing_kg (number)</li>
              <li>opening_bag (number)</li>
              <li>bag_produced (number)</li>
              <li>bag_sold (number)</li>
              <li>closing_bag (number)</li>
              <li>missing_bag (number)</li>
              <li>location (extension, newsite, or oldsite)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
