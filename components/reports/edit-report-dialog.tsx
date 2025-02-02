import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reportService } from "@/lib/report-service"
import { Report } from "@/types"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { downloadReportImage } from "@/lib/report-image-generator"
import { Edit } from "lucide-react"

interface EditReportDialogProps {
  report: Report
}

export function EditReportDialog({ report }: EditReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    opening_kg: report.opening_kg,
    additional_kg: report.additional_kg,
    kg_used: report.kg_used,
    closing_kg: report.closing_kg,
    opening_bag: report.opening_bag,
    bag_produced: report.bag_produced,
    bag_sold: report.bag_sold,
    closing_bag: report.closing_bag,
    missing_bag: report.missing_bag,
    location: report.location,
    report_date: report.report_date instanceof Date 
      ? report.report_date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return

    // Validate all required fields
    if (!formData.location) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive",
      })
      return
    }

    // Check if any numeric field is empty or 0
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

    for (const field of numericFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Error",
          description: `Please enter a value for ${field.replace('_', ' ')}`,
          variant: "destructive",
        })
        return
      }
    }
    
    setIsSubmitting(true)
    try {
      const updatedData = {
        ...formData,
        recorded_by: user.email,
        report_date: new Date(formData.report_date)
      }
      await reportService.updateReport(report.id, updatedData)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setOpen(false)
      toast({
        description: "Report updated successfully.",
      })
    } catch (error) {
      console.error("Error updating report:", error)
      toast({
        variant: "destructive",
        description: "Failed to update report.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await reportService.deleteReport(report.id)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setShowDeleteDialog(false)
      setOpen(false)
      toast({
        description: "Report deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        variant: "destructive",
        description: "Failed to delete report. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadReportImage(report);
      toast({
        description: "Report exported successfully.",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        variant: "destructive",
        description: "Failed to export report.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] scrollbar-hide max-h-[90vh] overflow-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Make changes to the report. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="report_date" className="text-left md:text-right">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="report_date"
                name="report_date"
                type="date"
                value={formData.report_date}
                onChange={handleChange}
                className="md:col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="opening_kg" className="text-left md:text-right">
                Opening KG <span className="text-red-500">*</span>
              </Label>
              <Input
                id="opening_kg"
                name="opening_kg"
                type="number"
                value={formData.opening_kg || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="additional_kg" className="text-left md:text-right">
                Additional KG <span className="text-red-500">*</span>
              </Label>
              <Input
                id="additional_kg"
                name="additional_kg"
                type="number"
                value={formData.additional_kg || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="kg_used" className="text-left md:text-right">
                KG Used <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kg_used"
                name="kg_used"
                type="number"
                value={formData.kg_used || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="closing_kg" className="text-left md:text-right">
                Closing KG <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closing_kg"
                name="closing_kg"
                type="number"
                value={formData.closing_kg || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="opening_bag" className="text-left md:text-right">
                Opening Bag <span className="text-red-500">*</span>
              </Label>
              <Input
                id="opening_bag"
                name="opening_bag"
                type="number"
                value={formData.opening_bag || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="bag_produced" className="text-left md:text-right">
                Bag Produced <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bag_produced"
                name="bag_produced"
                type="number"
                value={formData.bag_produced || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="bag_sold" className="text-left md:text-right">
                Bag Sold <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bag_sold"
                name="bag_sold"
                type="number"
                value={formData.bag_sold || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="closing_bag" className="text-left md:text-right">
                Closing Bag <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closing_bag"
                name="closing_bag"
                type="number"
                value={formData.closing_bag || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="missing_bag" className="text-left md:text-right">
                Missing Bag <span className="text-red-500">*</span>
              </Label>
              <Input
                id="missing_bag"
                name="missing_bag"
                type="number"
                value={formData.missing_bag || ''}
                onChange={handleChange}
                className="md:col-span-3"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="location" className="text-left md:text-right">
                Location <span className="text-red-500">*</span>
              </Label>
              <Select
                name="location"
                value={formData.location}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, location: value }))
                }
                required
              >
                <SelectTrigger className="md:col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extension">Extension</SelectItem>
                  <SelectItem value="newsite">New Site</SelectItem>
                  <SelectItem value="oldsite">Old Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <span>Export</span>
                )}
              </Button>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting || isSubmitting}
                  >
                    {isDeleting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this report.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
           
              <Button type="submit" disabled={isDeleting || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
