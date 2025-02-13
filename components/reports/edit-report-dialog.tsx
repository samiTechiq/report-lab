"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { reportService } from "@/lib/report-service";
import { downloadReportImage } from "@/lib/report-image-generator";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Report, ReportFormValues } from "@/types/report";
import { isAdminUser } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supervisorService } from "@/lib/services/supervisor-service";
import { ScrollArea } from "../ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

const formSteps = [
  { id: "basic", title: "Basic Information" },
  { id: "kg", title: "KG Information" },
  { id: "bags", title: "Bags Information" },
  { id: "stock", title: "Stock Information" },
];

type FormField = {
  name: keyof ReportFormValues;
  label: string;
};

interface EditReportDialogProps {
  report: Report;
}

export function EditReportDialog({ report }: EditReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    defaultValues: {
      ...report,
      report_date: report.report_date
        ? new Date(report.report_date)
        : new Date(),
    },
  });

  // Fetch supervisors for the select input
  const { data: supervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: () => supervisorService.getSupervisors(),
  });

  const onSubmit = async (data: ReportFormValues) => {
    try {
      const formattedData = {
        ...data,
        report_date:
          data.report_date === new Date(report.report_date)
            ? new Date(report.report_date) // Keep original date if unchanged
            : data.report_date, // Use new date if changed
        updated_by: user!.email,
      };

      await reportService.updateReport(report.id, formattedData);

      toast({
        title: "Success",
        description: "Report updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await reportService.deleteReport(report.id);
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setShowDeleteDialog(false);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report. Please try again.",
      });
    }
  };

  const handleDownloadImage = async () => {
    try {
      await downloadReportImage(report);
      toast({
        title: "Success",
        description: "Report image downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading report image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report image. Please try again.",
      });
    }
  };

  const nextFormStep = () => {
    setCurrentStep((prev) => (prev < formSteps.length - 1 ? prev + 1 : prev));
  };

  const prevFormStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const renderFormFields = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div>
              <label
                htmlFor="report_date"
                className="block text-sm font-medium text-gray-700"
              >
                Report Date
              </label>
              <input
                type="date"
                className="input-control"
                {...form.register("report_date")}
                required
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <select
                id="location"
                className="input-control"
                {...form.register("location")}
                required
              >
                <option value="">Select location</option>
                <option value="oldsite">Oldsite</option>
                <option value="newsite">Newsite</option>
                <option value="extension">Extension</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="sales_rep"
                className="block text-sm font-medium text-gray-700"
              >
                Sales Representative
              </label>
              <input
                type="text"
                className="input-control"
                {...form.register("sales_rep")}
                required
              />
            </div>
            <div>
              <label
                htmlFor="supervisor"
                className="block text-sm font-medium text-gray-700"
              >
                Supervisor
              </label>
              <select
                id="supervisor"
                className="input-control"
                {...form.register("supervisor")}
                required
              >
                <option value="">Select supervisor</option>
                {supervisors?.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.name}>
                    {supervisor.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div>
              <label
                htmlFor="opening_kg"
                className="block text-sm font-medium text-gray-700"
              >
                Opening KG
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("opening_kg", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="additional_kg"
                className="block text-sm font-medium text-gray-700"
              >
                Additional KG
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("additional_kg", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="kg_used"
                className="block text-sm font-medium text-gray-700"
              >
                KG Used
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("kg_used", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="closing_kg"
                className="block text-sm font-medium text-gray-700"
              >
                Closing KG
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("closing_kg", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="damage_kg"
                className="block text-sm font-medium text-gray-700"
              >
                Damage KG
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("damage_kg", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="each_kg_produced"
                className="block text-sm font-medium text-gray-700"
              >
                Each KG Produced
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("each_kg_produced", { valueAsNumber: true })}
                required
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div>
              <label
                htmlFor="opening_bag"
                className="block text-sm font-medium text-gray-700"
              >
                Opening Bag
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("opening_bag", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="bag_produced"
                className="block text-sm font-medium text-gray-700"
              >
                Bag Produced
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("bag_produced", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="bag_sold"
                className="block text-sm font-medium text-gray-700"
              >
                Bag Sold
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("bag_sold", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="closing_bag"
                className="block text-sm font-medium text-gray-700"
              >
                Closing Bag
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("closing_bag", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="missing_bag"
                className="block text-sm font-medium text-gray-700"
              >
                Missing Bag
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("missing_bag", { valueAsNumber: true })}
                required
              />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div>
              <label
                htmlFor="opening_stock"
                className="block text-sm font-medium text-gray-700"
              >
                Opening Stock
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("opening_stock", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="additional_stock"
                className="block text-sm font-medium text-gray-700"
              >
                Additional Stock
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("additional_stock", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="stock_used"
                className="block text-sm font-medium text-gray-700"
              >
                Stock Used
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("stock_used", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="damage_stock"
                className="block text-sm font-medium text-gray-700"
              >
                Damage Stock
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("damage_stock", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="closing_stock"
                className="block text-sm font-medium text-gray-700"
              >
                Closing Stock
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("closing_stock", { valueAsNumber: true })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="missing_stock"
                className="block text-sm font-medium text-gray-700"
              >
                Missing Stock
              </label>
              <input
                type="number"
                className="input-control"
                {...form.register("missing_stock", { valueAsNumber: true })}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        onClick={() => setOpen(true)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:w-full max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Edit Report{" "}
              <span className="hidden md:inline">
                - {formSteps[currentStep].title}
              </span>{" "}
            </DialogTitle>
            <DialogDescription>
              Make changes to the report here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderFormFields()}
            </form>
          </ScrollArea>

          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={prevFormStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft />
              </Button>
              {currentStep === formSteps.length - 1 ? (
                <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                  Save
                </Button>
              ) : (
                <Button type="button" onClick={nextFormStep}>
                  <ArrowRight />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {isAdminUser() && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadImage}
              >
                <Download />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
