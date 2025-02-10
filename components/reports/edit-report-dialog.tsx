"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { reportService } from "@/lib/report-service";
import { downloadReportImage } from "@/lib/report-image-generator";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Report, ReportFormValues } from "@/types/report";
import { isAdminUser } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditReportDialogProps {
  report: Report;
}

export function EditReportDialog({ report }: EditReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user has permission to edit this report
  const isAdmin = isAdminUser();
  const isReportCreator = user?.email === report.recorded_by;
  const canEditReport = isAdmin || isReportCreator;

  if (!canEditReport) {
    return null; // Don't render the edit button if user doesn't have permission
  }

  const form = useForm<ReportFormValues>({
    defaultValues: {
      opening_kg: report?.opening_kg,
      additional_kg: report?.additional_kg,
      kg_used: report?.kg_used,
      closing_kg: report?.closing_kg,
      each_kg_produced: report?.each_kg_produced,
      opening_bag: report?.opening_bag,
      bag_produced: report?.bag_produced,
      bag_sold: report?.bag_sold,
      missing_bag: report?.missing_bag,
      closing_bag: report.closing_bag,
      recorded_by: report.recorded_by,
      opening_stock: report?.opening_stock,
      additional_stock: report?.additional_stock,
      stock_used: report?.stock_used,
      damage_stock: report?.damage_stock,
      closing_stock: report?.closing_stock,
      missing_stock: report?.missing_stock,
      sales_rep: report?.sales_rep,
      supervisor: report?.supervisor,
      location: report?.location,
      report_date: report.report_date
        ? new Date(report.report_date)
        : new Date(),
    },
  });

  console.log("Form default values:", form.getValues());

  // Fetch supervisors for the select input
  const { data: supervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: supervisorService.getSupervisors,
  });

  const onSubmit = async (data: ReportFormValues) => {
    if (!user || !user.email) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to edit a report",
        variant: "destructive",
      });
      return;
    }

    // Check if user has permission to edit this report
    const isAdmin = isAdminUser();
    const isReportCreator = report.recorded_by === user.email;
    
    if (!isAdmin && !isReportCreator) {
      toast({
        title: "Permission Denied",
        description: "You can only edit reports that you created",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportService.updateReport(report.id, {
        ...data,
        updated_at: new Date(),
        updated_by: user.email,
      });

      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Success",
        description: "Report updated successfully",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await reportService.deleteReport(report.id);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      setShowDeleteDialog(false);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadReportImage(report)}>
            Export Image
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Make changes to the report below
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="mx-4">
                  <FormField
                    control={form.control}
                    name="report_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            required
                            {...field}
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split("T")[0]
                                : typeof field.value === 'string'
                                ? new Date(field.value).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              field.onChange(
                                e.target.value ? new Date(e.target.value) : null
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="opening_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Kg</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additional_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Kg</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kg_used"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kg used</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closing_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Kg</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="each_kg_produced"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Each Kg Produced</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="opening_bag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening bag</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bag_produced"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bag Produced</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bag_sold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bags Sold</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closing_bag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Bags</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="missing_bag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Missing Bag</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="opening_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additional_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock_used"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Used</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="damage_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closing_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="missing_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Missing Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sales_rep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Representative</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sales representative" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {supervisors?.map((supervisor) => (
                              <SelectItem
                                key={supervisor.id}
                                value={supervisor.name}
                              >
                                {supervisor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supervisor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supervisor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supervisor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {supervisors?.map((supervisor) => (
                              <SelectItem
                                key={supervisor.id}
                                value={supervisor.name}
                              >
                                {supervisor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="extension">Extension</SelectItem>
                            <SelectItem value="oldsite">Oldsite</SelectItem>
                            <SelectItem value="newsite">Newsite</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadReportImage(report)}
                >
                  Export Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
