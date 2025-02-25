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
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { reportService } from "@/lib/report-service";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ReportFormValues } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import { supervisorService } from "@/lib/services/supervisor-service";
import { ScrollArea } from "../ui/scroll-area";
import { Plus } from "lucide-react";

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

export function CreateReportDialog() {
	const [open, setOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [dateValue, setDateValue] = useState("");
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

	const { data: supervisors } = useQuery({
		queryKey: ["supervisors"],
		queryFn: supervisorService.getSupervisors,
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmittingAndAdding, setIsSubmittingAndAdding] = useState(false);

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
			setIsSubmitting(true);
			const reportDate =
				data.report_date instanceof Date
					? data.report_date
					: new Date(data.report_date);

			// const hasDuplicate = await reportService.checkDuplicateReport(
			// 	reportDate,
			// 	data.location
			// );

			// if (hasDuplicate) {
			// 	toast({
			// 		variant: "destructive",
			// 		title: "Duplicate Report",
			// 		description:
			// 			"A report already exists for this date and location.",
			// 	});
			// 	return;
			// }

			const formattedData = {
				...data,
				report_date: new Date(data.report_date + "T12:00:00"),
				recorded_by: user.email,
				updated_by: user.email,
			};

			await reportService.createReport(formattedData);

			toast({
				title: "Success",
				description: "Report created successfully",
			});

			queryClient.invalidateQueries({ queryKey: ["reports"] });
			form.reset();
			setOpen(false);
		} catch (error) {
			console.error("Error creating report:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to create report. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmitAndAddAnother = async (data: ReportFormValues) => {
		if (!user || !user.email) {
			toast({
				title: "Authentication Error",
				description: "You must be logged in to create a report",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsSubmittingAndAdding(true);
			const reportDate =
				data.report_date instanceof Date
					? data.report_date
					: new Date(data.report_date);

			const hasDuplicate = await reportService.checkDuplicateReport(
				reportDate,
				data.location
			);

			if (hasDuplicate) {
				toast({
					variant: "destructive",
					title: "Duplicate Report",
					description:
						"A report already exists for this date and location.",
				});
				return;
			}

			const formattedData = {
				...data,
				report_date: new Date(data.report_date + "T12:00:00"),
				recorded_by: user.email,
				updated_by: user.email,
			};

			await reportService.createReport(formattedData);

			toast({
				title: "Success",
				description: "Report created successfully",
			});

			// Reset form without closing modal or invalidating cache
			form.reset();
			setCurrentStep(0);
		} catch (error) {
			console.error("Error creating report:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to create report. Please try again.",
			});
		} finally {
			setIsSubmittingAndAdding(false);
		}
	};

	const currentStepFields = [
		["report_date", "location", "sales_rep", "supervisor"],
		[
			"opening_kg",
			"additional_kg",
			"kg_used",
			"closing_kg",
			"damage_kg",
			"each_kg_produced",
		],
		[
			"opening_bag",
			"bag_produced",
			"bag_sold",
			"missing_bag",
			"closing_bag",
		],
		[
			"opening_stock",
			"additional_stock",
			"stock_used",
			"damage_stock",
			"closing_stock",
			"missing_stock",
		],
	];

	const nextStep = () => {
		// Validate current step fields
		const stepFields = currentStepFields[currentStep];
		const stepIsValid = stepFields.every((field) => {
			const value = form.getValues(field as keyof ReportFormValues);
			return value !== undefined && value !== "" && value !== 0;
		});

		if (!stepIsValid) {
			toast({
				title: "Validation Error",
				description: "Please fill in all fields before proceeding",
				variant: "destructive",
			});
			return;
		}

		if (currentStep < formSteps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const handleSubmit = async () => {
		const allFields = [
			...currentStepFields[0],
			...currentStepFields[1],
			...currentStepFields[2],
			...currentStepFields[3],
		];

		const formIsValid = allFields.every((field) => {
			const value = form.getValues(field as keyof ReportFormValues);
			return value !== undefined && value !== "" && value !== 0;
		});

		if (!formIsValid) {
			toast({
				title: "Validation Error",
				description: "Please fill in all fields before submitting",
				variant: "destructive",
			});
			return;
		}

		await form.handleSubmit(onSubmit)();
	};

	const renderBasicInfo = () => {
		const reportDate = form.getValues("report_date");
		// Ensure we have a valid Date object and format it for the input
		const dateValue =
			reportDate instanceof Date
				? reportDate.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0];

		return (
			<div className="space-y-4">
				<div className="grid gap-4">
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
							<option value="extension">Extension</option>
							<option value="oldsite">Oldsite</option>
							<option value="newsite">Newsite</option>
						</select>
					</div>
					<div>
						<label
							htmlFor="sales_rep"
							className="block text-sm font-medium text-gray-700"
						>
							Sales Representative
						</label>
						<select
							id="sales_rep"
							className="input-control"
							{...form.register("sales_rep")}
							required
						>
							<option value="">
								Select sales representative
							</option>
							{supervisors?.map((supervisor) => (
								<option
									key={supervisor.id}
									value={supervisor.name}
								>
									{supervisor.name}
								</option>
							))}
						</select>
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
								<option
									key={supervisor.id}
									value={supervisor.name}
								>
									{supervisor.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
		);
	};

	const renderKgInfo = () => (
		<div className="space-y-4">
			<div className="grid gap-4">
				{[
					{ name: "opening_kg" as const, label: "Opening KG" },
					{ name: "additional_kg" as const, label: "Additional KG" },
					{ name: "kg_used" as const, label: "KG Used" },
					{ name: "closing_kg" as const, label: "Closing KG" },
					{
						name: "each_kg_produced" as const,
						label: "Each KG Produced",
					},
					{ name: "damage_kg" as const, label: "Damage KG" },
				].map((field) => (
					<div key={field.name}>
						<label
							htmlFor={field.name}
							className="block text-sm font-medium text-gray-700"
						>
							{field.label}
						</label>
						<input
							type="number"
							id={field.name}
							className="input-control"
							{...form.register(field.name)}
							required
						/>
					</div>
				))}
			</div>
		</div>
	);

	const renderBagsInfo = () => (
		<div className="space-y-4">
			<div className="grid gap-4">
				{[
					{ name: "opening_bag" as const, label: "Opening Bags" },
					{ name: "bag_produced" as const, label: "Bags Produced" },
					{ name: "bag_sold" as const, label: "Bags Sold" },
					{ name: "closing_bag" as const, label: "Closing Bags" },
					{ name: "missing_bag" as const, label: "Missing Bags" },
				].map((field) => (
					<div key={field.name}>
						<label
							htmlFor={field.name}
							className="block text-sm font-medium text-gray-700"
						>
							{field.label}
						</label>
						<input
							type="number"
							id={field.name}
							className="input-control"
							{...form.register(field.name)}
							required
						/>
					</div>
				))}
			</div>
		</div>
	);

	const renderStockInfo = () => (
		<div className="space-y-4">
			<div className="grid gap-4">
				{[
					{ name: "opening_stock" as const, label: "Opening Stock" },
					{
						name: "additional_stock" as const,
						label: "Additional Stock",
					},
					{ name: "stock_used" as const, label: "Stock Used" },
					{ name: "damage_stock" as const, label: "Damage Stock" },
					{ name: "closing_stock" as const, label: "Closing Stock" },
					{ name: "missing_stock" as const, label: "Missing Stock" },
				].map((field) => (
					<div key={field.name}>
						<label
							htmlFor={field.name}
							className="block text-sm font-medium text-gray-700"
						>
							{field.label}
						</label>
						<input
							type="number"
							id={field.name}
							className="input-control"
							{...form.register(field.name)}
							required
						/>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Report</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						Create Report{" "}
						<span className="hidden md:inline">
							- {formSteps[currentStep].title}
						</span>{" "}
					</DialogTitle>
					<DialogDescription>
						<span className="font-semibold text-red-500 md:hidden">
							{formSteps[currentStep].title} -
						</span>{" "}
						step {currentStep + 1} of {formSteps.length}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
					}}
					className="space-y-4"
				>
					<ScrollArea className="h-[400px] pr-4">
						<div className="mx-4 mb-4">
							{currentStep === 0 && renderBasicInfo()}
							{currentStep === 1 && renderKgInfo()}
							{currentStep === 2 && renderBagsInfo()}
							{currentStep === 3 && renderStockInfo()}
						</div>
					</ScrollArea>
					<DialogFooter className="flex justify-between">
						<div className="flex gap-2">
							{currentStep > 0 && (
								<Button
									type="button"
									variant="outline"
									className="text-sm"
									onClick={prevStep}
								>
									Previous
								</Button>
							)}
							{currentStep < formSteps.length - 1 && (
								<Button
									type="button"
									className="text-sm"
									onClick={nextStep}
								>
									Next
								</Button>
							)}
						</div>
						{currentStep === formSteps.length - 1 && (
							<div className="flex gap-2 mb-2">
								<Button
									type="button"
									className="text-sm"
									onClick={form.handleSubmit(
										onSubmitAndAddAnother
									)}
									disabled={
										isSubmittingAndAdding || isSubmitting
									}
								>
									{isSubmittingAndAdding ? (
										"Saving..."
									) : (
										<> Save & add new</>
									)}
								</Button>
								<Button
									type="submit"
									className="text-sm"
									onClick={form.handleSubmit(onSubmit)}
									disabled={
										isSubmitting || isSubmittingAndAdding
									}
								>
									{isSubmitting ? "Saving..." : "Save"}
								</Button>
							</div>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
