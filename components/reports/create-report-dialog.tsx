import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { reportService } from "@/lib/report-service";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CreateReportDialog() {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user } = useAuth();
	const [formData, setFormData] = useState({
		opening_kg: "0",
		additional_kg: "0",
		kg_used: "0",
		closing_kg: "0",
		opening_bag: "0",
		bag_produced: "0",
		bag_sold: "0",
		closing_bag: "0",
		missing_bag: "0",
		location: "",
		report_date: new Date().toISOString().split("T")[0],
	});
	const queryClient = useQueryClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?.email) return;

		// Validate all required fields
		if (!formData.location) {
			toast({
				title: "Error",
				description: "Please select a location",
				variant: "destructive",
			});
			return;
		}

		// Check if any numeric field is empty or 0
		const numericFields = [
			"opening_kg",
			"additional_kg",
			"kg_used",
			"closing_kg",
			"opening_bag",
			"bag_produced",
			"bag_sold",
			"closing_bag",
			"missing_bag",
		];

		for (const field of numericFields) {
			if (!formData[field as keyof typeof formData]) {
				toast({
					title: "Error",
					description: `Please enter a value for ${field.replace(
						"_",
						" "
					)}`,
					variant: "destructive",
				});
				return;
			}
		}

		setIsSubmitting(true);
		try {
			await reportService.createReport({
				...formData,
				recorded_by: user.email,
				report_date: new Date(formData.report_date),
				opening_kg: String(formData.opening_kg),
				additional_kg: String(formData.additional_kg),
				kg_used: String(formData.kg_used),
				closing_kg: String(formData.closing_kg),
				opening_bag: String(formData.opening_bag),
				bag_produced: String(formData.bag_produced),
				bag_sold: String(formData.bag_sold),
				closing_bag: String(formData.closing_bag),
			});
			// Invalidate and refetch reports
			queryClient.invalidateQueries({ queryKey: ["reports"] });
			setOpen(false);
			setFormData({
				opening_kg: "0",
				additional_kg: "0",
				kg_used: "0",
				closing_kg: "0",
				opening_bag: "0",
				bag_produced: "0",
				bag_sold: "0",
				closing_bag: "0",
				missing_bag: "0",
				location: "",
				report_date: new Date().toISOString().split("T")[0],
			});
			toast({
				title: "Success",
				description: "Report created successfully",
			});
		} catch (error) {
			console.error("Error creating report:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;

		// For number inputs, only allow numeric values
		if (type === "number") {
			// Only update if the value is empty or a valid number
			if (value === "" || /^\d*\.?\d*$/.test(value)) {
				setFormData((prev) => ({
					...prev,
					[name]: value,
				}));
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 text-center w-4 block md:hidden" />
					<span className="hidden md:block">Add New Report</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] scrollbar-hide max-h-[90vh] overflow-auto">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create Report</DialogTitle>
						<DialogDescription>
							Add a new report to the system. All fields are
							required.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4 scrollbar-hide">
						<div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
							<Label
								htmlFor="report_date"
								className="text-left md:text-right"
							>
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
							<Label
								htmlFor="opening_kg"
								className="text-left md:text-right md:col-span-1"
							>
								Opening KG{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="opening_kg"
								name="opening_kg"
								type="number"
								value={formData.opening_kg || ""}
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
							<Label
								htmlFor="additional_kg"
								className="text-left md:text-right"
							>
								Additional KG{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="additional_kg"
								name="additional_kg"
								type="number"
								value={formData.additional_kg || ""}
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
							<Label
								htmlFor="kg_used"
								className="text-left md:text-right"
							>
								KG Used <span className="text-red-500">*</span>
							</Label>
							<Input
								id="kg_used"
								name="kg_used"
								type="number"
								value={formData.kg_used || ""}
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
							<Label
								htmlFor="closing_kg"
								className="text-left md:text-right"
							>
								Closing KG{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="closing_kg"
								name="closing_kg"
								type="number"
								value={formData.closing_kg || ""}
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
							<Label
								htmlFor="opening_bag"
								className="text-left md:text-right"
							>
								Opening Bag{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="opening_bag"
								name="opening_bag"
								type="number"
								value={formData.opening_bag || ""}
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
							<Label
								htmlFor="bag_produced"
								className="text-left md:text-right"
							>
								Bag Produced{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="bag_produced"
								name="bag_produced"
								type="number"
								value={formData.bag_produced || ""}
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
							<Label
								htmlFor="bag_sold"
								className="text-left md:text-right"
							>
								Bag Sold <span className="text-red-500">*</span>
							</Label>
							<Input
								id="bag_sold"
								name="bag_sold"
								type="number"
								value={formData.bag_sold || ""}
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
							<Label
								htmlFor="closing_bag"
								className="text-left md:text-right"
							>
								Closing Bag{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="closing_bag"
								name="closing_bag"
								type="number"
								value={formData.closing_bag || ""}
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
							<Label
								htmlFor="missing_bag"
								className="text-left md:text-right"
							>
								Missing Bag{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="missing_bag"
								name="missing_bag"
								type="number"
								value={formData.missing_bag || ""}
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
							<Label
								htmlFor="location"
								className="text-left md:text-right"
							>
								Location <span className="text-red-500">*</span>
							</Label>
							<Select
								name="location"
								value={formData.location}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										location: value,
									}))
								}
								required
							>
								<SelectTrigger className="md:col-span-3">
									<SelectValue placeholder="Select location" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="extension">
										Extension
									</SelectItem>
									<SelectItem value="newsite">
										New Site
									</SelectItem>
									<SelectItem value="oldsite">
										Old Site
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner size="sm" className="mr-2" />
									Creating...
								</>
							) : (
								"Create Report"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
