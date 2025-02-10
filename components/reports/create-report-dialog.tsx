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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ReportFormValues } from "@/types/report";
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

export function CreateReportDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    defaultValues: {
      opening_kg: 0,
      additional_kg: 0,
      kg_used: 0,
      closing_kg: 0,
      damage_kg: 0,
      each_kg_produced: 0,
      opening_bag: 0,
      bag_produced: 0,
      bag_sold: 0,
      missing_bag: 0,
      closing_bag: 0,
      opening_stock: 0,
      additional_stock: 0,
      stock_used: 0,
      damage_stock: 0,
      closing_stock: 0,
      missing_stock: 0,
      recorded_by: "",
      sales_rep: "",
      supervisor: "",
      location: "",
      report_date: new Date(),
    },
  });

  // Fetch supervisors for the select input
  const { data: supervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: supervisorService.getSupervisors,
  });

  const onSubmit = async (data: ReportFormValues) => {
    if (!user || !user.email) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a report",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportService.createReport({
        ...data,
        recorded_by: user.email,
        updated_by: "",
      });

      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Success",
        description: "Report created successfully",
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Report</DialogTitle>
          <DialogDescription>
            Create a new report with the form below
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="mx-4 mb-4">
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
                          value={field.value.toISOString().split("T")[0] || ""}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : ""
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="my-4 border-b border-gray-300">
                  <h1 className="text-sm font-semibold">Kg Information</h1>
                </div>
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
                  name="damage_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage Kg</FormLabel>
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
                <div className="my-4 border-b border-gray-300">
                  <h1 className="text-sm font-semibold">Product Information</h1>
                </div>
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
                <div className="my-4 border-b border-gray-300">
                  <h1 className="text-sm font-semibold">
                    Packing Bag Information
                  </h1>
                </div>
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
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
