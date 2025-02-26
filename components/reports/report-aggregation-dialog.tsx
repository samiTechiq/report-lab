"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Report } from "@/types/report";
import { BarChart3 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { ReportPdfExporter } from "@/components/report-pdf-exporter";

interface ReportAggregationDialogProps {
	reports: Report[];
	startDate?: string;
	endDate?: string;
	isLoading?: boolean;
}

// Shared interfaces for aggregation data
interface BaseAggregatedData {
	totalKgUsed: number;
	totalBagProduced: number;
	totalBagSold: number;
	totalMissingBag: number;
	count: number;
}

interface LocationData extends BaseAggregatedData {
	location: string;
}

interface SupervisorData extends BaseAggregatedData {
	supervisor: string;
}

interface SalesRepData extends BaseAggregatedData {
	salesRep: string;
}

// Helper function for safe number conversion - handles all Firestore numeric values
function safeNumber(value: unknown): number {
	// Return 0 for null, undefined, or NaN
	if (value === null || value === undefined || Number.isNaN(value)) return 0;

	// For numbers, return as is if valid
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	// For strings or any other type, convert to number and check
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
}

// Helper function for safe division
function safeDivide(numerator: number, denominator: number): number {
	// Avoid division by zero or very small numbers
	if (!denominator || denominator < 0.0001) return 0;
	return numerator / denominator;
}

export function ReportAggregationDialog({
	reports,
	startDate,
	endDate,
	isLoading = false,
}: ReportAggregationDialogProps) {
	// State for active tab
	const [activeTab, setActiveTab] = useState("location");
	const [open, setOpen] = useState(false);

	// Create a clean data array by filtering out potentially problematic reports
	const validReports = reports.filter(
		(report) =>
			// Ensure the report and its key fields exist
			report && typeof report === "object"
	);

	// --- LOCATION AGGREGATION ---
	const locationData = validReports.reduce(
		(acc: { [key: string]: LocationData }, report) => {
			// Use default location if missing
			const location = report.location || "Unknown";

			// Initialize location data if not exists
			if (!acc[location]) {
				acc[location] = {
					location,
					totalKgUsed: 0,
					totalBagProduced: 0,
					totalBagSold: 0,
					totalMissingBag: 0,
					count: 0,
				};
			}

			// Add values with safe number conversion
			acc[location].totalKgUsed += safeNumber(report.kg_used);
			acc[location].totalBagProduced += safeNumber(report.bag_produced);
			acc[location].totalBagSold += safeNumber(report.bag_sold);
			acc[location].totalMissingBag += safeNumber(report.missing_bag);
			acc[location].count++;

			return acc;
		},
		{}
	);
	const locationArray = Object.values(locationData);
	const locationTotals = calculateTotals(locationArray);

	// --- SUPERVISOR AGGREGATION ---
	const supervisorData = validReports.reduce(
		(acc: { [key: string]: SupervisorData }, report) => {
			// Use default supervisor if missing
			const supervisor = report.supervisor || "Unknown";

			// Initialize supervisor data if not exists
			if (!acc[supervisor]) {
				acc[supervisor] = {
					supervisor,
					totalKgUsed: 0,
					totalBagProduced: 0,
					totalBagSold: 0,
					totalMissingBag: 0,
					count: 0,
				};
			}

			// Add values with safe number conversion
			acc[supervisor].totalKgUsed += safeNumber(report.kg_used);
			acc[supervisor].totalBagProduced += safeNumber(report.bag_produced);
			acc[supervisor].totalBagSold += safeNumber(report.bag_sold);
			acc[supervisor].totalMissingBag += safeNumber(report.missing_bag);
			acc[supervisor].count++;

			return acc;
		},
		{}
	);
	const supervisorArray = Object.values(supervisorData);
	const supervisorTotals = calculateTotals(supervisorArray);

	// --- SALES REP AGGREGATION ---
	const salesRepData = validReports.reduce(
		(acc: { [key: string]: SalesRepData }, report) => {
			// Use default sales_rep if missing
			const salesRep = report.sales_rep || "Unknown";

			// Initialize sales_rep data if not exists
			if (!acc[salesRep]) {
				acc[salesRep] = {
					salesRep,
					totalKgUsed: 0,
					totalBagProduced: 0,
					totalBagSold: 0,
					totalMissingBag: 0,
					count: 0,
				};
			}

			// Add values with safe number conversion
			acc[salesRep].totalKgUsed += safeNumber(report.kg_used);
			acc[salesRep].totalBagProduced += safeNumber(report.bag_produced);
			acc[salesRep].totalBagSold += safeNumber(report.bag_sold);
			acc[salesRep].totalMissingBag += safeNumber(report.missing_bag);
			acc[salesRep].count++;

			return acc;
		},
		{}
	);
	const salesRepArray = Object.values(salesRepData);
	const salesRepTotals = calculateTotals(salesRepArray);

	// Function to calculate totals for any array of aggregated data
	function calculateTotals<T extends BaseAggregatedData>(data: T[]) {
		return data.reduce(
			(acc, curr) => ({
				totalKgUsed: acc.totalKgUsed + curr.totalKgUsed,
				totalBagProduced: acc.totalBagProduced + curr.totalBagProduced,
				totalBagSold: acc.totalBagSold + curr.totalBagSold,
				totalMissingBag: acc.totalMissingBag + curr.totalMissingBag,
				count: acc.count + curr.count,
			}),
			{
				totalKgUsed: 0,
				totalBagProduced: 0,
				totalBagSold: 0,
				totalMissingBag: 0,
				count: 0,
			}
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					title="View Aggregated Report"
				>
					<BarChart3 className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] p-4 md:p-6 overflow-hidden overflow-y-auto scrollbar-hide">
				<DialogHeader className="mb-4">
					<DialogTitle>Aggregated Report Analysis</DialogTitle>
					<DialogDescription>
						{startDate && endDate
							? `Summary of reports from ${new Date(
									startDate
							  ).toLocaleDateString()} to ${new Date(
									endDate
							  ).toLocaleDateString()}`
							: startDate
							? `Summary of reports from ${new Date(
									startDate
							  ).toLocaleDateString()} onwards`
							: endDate
							? `Summary of reports up to ${new Date(
									endDate
							  ).toLocaleDateString()}`
							: "Summary of all reports"}
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex justify-center items-center h-40">
						<Spinner className="h-8 w-8" />
						<span className="ml-2">
							Loading aggregation data...
						</span>
					</div>
				) : validReports.length === 0 ? (
					<div className="text-center py-8">
						No report data available for aggregation.
					</div>
				) : (
					<>
						<ReportPdfExporter
							reports={validReports}
							startDate={startDate}
							endDate={endDate}
							isLoading={isLoading}
						/>
						<Tabs
							defaultValue="location"
							value={activeTab}
							onValueChange={setActiveTab}
						>
							<TabsList className="grid w-full grid-cols-3 mb-4">
								<TabsTrigger value="location">
									By Location
								</TabsTrigger>
								<TabsTrigger value="supervisor">
									By Supervisor
								</TabsTrigger>
								<TabsTrigger value="sales_rep">
									By Sales Rep
								</TabsTrigger>
							</TabsList>

							{/* Location Tab Content */}
							<TabsContent value="location" className="mt-0">
								<ScrollArea className="h-[60vh]">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-[150px]">
														Location
													</TableHead>
													<TableHead>
														Total KG Used
													</TableHead>
													<TableHead>
														Total Bag Produced
													</TableHead>
													<TableHead>
														Total Bag Sold
													</TableHead>
													<TableHead>
														Total Missing Bags
													</TableHead>
													<TableHead>
														Number of Reports
													</TableHead>
													<TableHead>
														Each KG Produced
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{locationArray.map((data) => {
													const bagsPerKg =
														safeDivide(
															data.totalBagProduced,
															data.totalKgUsed
														);
													return (
														<TableRow
															key={data.location}
														>
															<TableCell className="font-medium">
																{data.location}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalKgUsed
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalBagProduced
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalBagSold
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalMissingBag
																)}
															</TableCell>
															<TableCell>
																{data.count}
															</TableCell>
															<TableCell>
																{formatNumber(
																	bagsPerKg
																)}
															</TableCell>
														</TableRow>
													);
												})}
												<TableRow className="font-bold bg-muted/50">
													<TableCell>TOTAL</TableCell>
													<TableCell>
														{formatNumber(
															locationTotals.totalKgUsed
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															locationTotals.totalBagProduced
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															locationTotals.totalBagSold
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															locationTotals.totalMissingBag
														)}
													</TableCell>
													<TableCell>
														{locationTotals.count}
													</TableCell>
													<TableCell>
														{formatNumber(
															safeDivide(
																locationTotals.totalBagProduced,
																locationTotals.totalKgUsed
															)
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</div>
								</ScrollArea>
							</TabsContent>

							{/* Supervisor Tab Content */}
							<TabsContent value="supervisor" className="mt-0">
								<ScrollArea className="h-[60vh]">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-[150px]">
														Supervisor
													</TableHead>
													<TableHead>
														Total KG Used
													</TableHead>
													<TableHead>
														Total Bag Produced
													</TableHead>
													<TableHead>
														Total Bag Sold
													</TableHead>
													<TableHead>
														Total Missing Bags
													</TableHead>
													<TableHead>
														Number of Reports
													</TableHead>
													<TableHead>
														Each KG Produced
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{supervisorArray.map((data) => {
													const bagsPerKg =
														safeDivide(
															data.totalBagProduced,
															data.totalKgUsed
														);
													return (
														<TableRow
															key={
																data.supervisor
															}
														>
															<TableCell className="font-medium">
																{
																	data.supervisor
																}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalKgUsed
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalBagProduced
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalBagSold
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalMissingBag
																)}
															</TableCell>
															<TableCell>
																{data.count}
															</TableCell>
															<TableCell>
																{formatNumber(
																	bagsPerKg
																)}
															</TableCell>
														</TableRow>
													);
												})}
												<TableRow className="font-bold bg-muted/50">
													<TableCell>TOTAL</TableCell>
													<TableCell>
														{formatNumber(
															supervisorTotals.totalKgUsed
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															supervisorTotals.totalBagProduced
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															supervisorTotals.totalBagSold
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															supervisorTotals.totalMissingBag
														)}
													</TableCell>
													<TableCell>
														{supervisorTotals.count}
													</TableCell>
													<TableCell>
														{formatNumber(
															safeDivide(
																supervisorTotals.totalBagProduced,
																supervisorTotals.totalKgUsed
															)
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</div>
								</ScrollArea>
							</TabsContent>

							{/* Sales Rep Tab Content */}
							<TabsContent value="sales_rep" className="mt-0">
								<ScrollArea className="h-[60vh]">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-[150px]">
														Sales Representative
													</TableHead>
													<TableHead>
														Total KG Used
													</TableHead>
													<TableHead>
														Total Bag Produced
													</TableHead>
													<TableHead>
														Total Bag Sold
													</TableHead>
													<TableHead>
														Total Missing Bags
													</TableHead>
													<TableHead>
														Number of Reports
													</TableHead>
													<TableHead>
														Each KG Produced
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{salesRepArray.map((data) => {
													const bagsPerKg =
														safeDivide(
															data.totalBagProduced,
															data.totalKgUsed
														);
													return (
														<TableRow
															key={data.salesRep}
														>
															<TableCell className="font-medium">
																{data.salesRep}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalKgUsed
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalBagProduced
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalBagSold
																)}
															</TableCell>
															<TableCell>
																{formatNumber(
																	data.totalMissingBag
																)}
															</TableCell>
															<TableCell>
																{data.count}
															</TableCell>
															<TableCell>
																{formatNumber(
																	bagsPerKg
																)}
															</TableCell>
														</TableRow>
													);
												})}
												<TableRow className="font-bold bg-muted/50">
													<TableCell>TOTAL</TableCell>
													<TableCell>
														{formatNumber(
															salesRepTotals.totalKgUsed
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															salesRepTotals.totalBagProduced
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															salesRepTotals.totalBagSold
														)}
													</TableCell>
													<TableCell>
														{formatNumber(
															salesRepTotals.totalMissingBag
														)}
													</TableCell>
													<TableCell>
														{salesRepTotals.count}
													</TableCell>
													<TableCell>
														{formatNumber(
															safeDivide(
																salesRepTotals.totalBagProduced,
																salesRepTotals.totalKgUsed
															)
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</div>
								</ScrollArea>
							</TabsContent>
						</Tabs>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
