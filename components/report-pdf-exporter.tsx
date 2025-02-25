"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/report";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumber } from "@/lib/utils";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// Helper functions from your aggregation component
function safeNumber(value: unknown): number {
	if (value === null || value === undefined || Number.isNaN(value)) return 0;
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
}

function safeDivide(numerator: number, denominator: number): number {
	if (!denominator || denominator < 0.0001) return 0;
	return numerator / denominator;
}

// Interfaces for aggregated data
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

interface ReportPdfExporterProps {
	reports: Report[];
	startDate?: string;
	endDate?: string;
	isLoading?: boolean;
}

export function ReportPdfExporter({
	reports,
	startDate,
	endDate,
	isLoading = false,
}: ReportPdfExporterProps) {
	// Process data for PDF export
	const processData = () => {
		// Filter valid reports
		const validReports = reports.filter(
			(report) => report && typeof report === "object"
		);

		// Location data aggregation
		const locationData = validReports.reduce(
			(acc: { [key: string]: LocationData }, report) => {
				const location = report.location || "Unknown";
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
				acc[location].totalKgUsed += safeNumber(report.kg_used);
				acc[location].totalBagProduced += safeNumber(
					report.bag_produced
				);
				acc[location].totalBagSold += safeNumber(report.bag_sold);
				acc[location].totalMissingBag += safeNumber(report.missing_bag);
				acc[location].count++;
				return acc;
			},
			{}
		);
		const locationArray = Object.values(locationData);

		// Supervisor data aggregation
		const supervisorData = validReports.reduce(
			(acc: { [key: string]: SupervisorData }, report) => {
				const supervisor = report.supervisor || "Unknown";
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
				acc[supervisor].totalKgUsed += safeNumber(report.kg_used);
				acc[supervisor].totalBagProduced += safeNumber(
					report.bag_produced
				);
				acc[supervisor].totalBagSold += safeNumber(report.bag_sold);
				acc[supervisor].totalMissingBag += safeNumber(
					report.missing_bag
				);
				acc[supervisor].count++;
				return acc;
			},
			{}
		);
		const supervisorArray = Object.values(supervisorData);

		// Sales Rep data aggregation
		const salesRepData = validReports.reduce(
			(acc: { [key: string]: SalesRepData }, report) => {
				const salesRep = report.sales_rep || "Unknown";
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
				acc[salesRep].totalKgUsed += safeNumber(report.kg_used);
				acc[salesRep].totalBagProduced += safeNumber(
					report.bag_produced
				);
				acc[salesRep].totalBagSold += safeNumber(report.bag_sold);
				acc[salesRep].totalMissingBag += safeNumber(report.missing_bag);
				acc[salesRep].count++;
				return acc;
			},
			{}
		);
		const salesRepArray = Object.values(salesRepData);

		return {
			locationArray,
			supervisorArray,
			salesRepArray,
		};
	};

	// Helper function to create chart and get base64 image
	const createChartImage = (
		config: {
			labels: string[];
			datasets: {
				label: string;
				data: number[];
				backgroundColor: string | string[];
			}[];
		},
		options: any,
		width = 800,
		height = 400
	): Promise<string> => {
		return new Promise((resolve, reject) => {
			try {
				// Create a canvas element
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				document.body.appendChild(canvas);

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					document.body.removeChild(canvas);
					reject(new Error("Could not get canvas context"));
					return;
				}

				// Create chart
				const chart = new Chart(ctx, {
					type: "bar",
					data: config,
					options: {
						animation: false, // Disable animations for better PDF rendering
						...options,
					},
				});

				// Wait for the chart to render
				setTimeout(() => {
					try {
						const imageData = canvas.toDataURL("image/png");
						chart.destroy();
						document.body.removeChild(canvas);
						resolve(imageData);
					} catch (error) {
						reject(error);
					}
				}, 500); // Allow time for the chart to render
			} catch (error) {
				reject(error);
			}
		});
	};

	// Generate and download PDF
	const generatePDF = async () => {
		if (isLoading || reports.length === 0) return;

		try {
			const { locationArray, supervisorArray, salesRepArray } =
				processData();

			// Create PDF document
			const pdf = new jsPDF("landscape", "mm", "a4");
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();

			// Add title and date range
			pdf.setFontSize(18);
			pdf.text("Aggregated Report Analysis", 15, 15);

			pdf.setFontSize(12);
			const dateText =
				startDate && endDate
					? `Reports from ${new Date(
							startDate
					  ).toLocaleDateString()} to ${new Date(
							endDate
					  ).toLocaleDateString()}`
					: startDate
					? `Reports from ${new Date(startDate).toLocaleDateString()}`
					: endDate
					? `Reports up to ${new Date(endDate).toLocaleDateString()}`
					: "All reports";

			pdf.text(dateText, 15, 22);
			pdf.text(`Total Reports: ${reports.length}`, 15, 28);
			pdf.line(15, 30, pageWidth - 15, 30);

			// By Location section
			pdf.setFontSize(16);
			pdf.text("Analysis by Location", 15, 38);

			// Location table
			autoTable(pdf, {
				startY: 42,
				head: [
					[
						"Location",
						"KG Used",
						"Bag Produced",
						"Bag Sold",
						"Missing Bags",
						"Reports",
						"Each KG Produced",
					],
				],
				body: locationArray.map((item) => [
					item.location,
					formatNumber(item.totalKgUsed),
					formatNumber(item.totalBagProduced),
					formatNumber(item.totalBagSold),
					formatNumber(item.totalMissingBag),
					item.count,
					formatNumber(
						safeDivide(item.totalBagProduced, item.totalKgUsed)
					),
				]),
				styles: { fontSize: 10, cellPadding: 3 },
				headStyles: { fillColor: [41, 128, 185], textColor: 255 },
				alternateRowStyles: { fillColor: [245, 245, 245] },
			});

			// Location chart
			if (locationArray.length > 0) {
				// Limit to top 10 locations if there are too many
				const chartLocations =
					locationArray.length > 10
						? locationArray
								.sort(
									(a, b) =>
										b.totalBagProduced - a.totalBagProduced
								)
								.slice(0, 10)
						: locationArray;

				const locationChart = {
					labels: chartLocations.map((item) => item.location),
					datasets: [
						{
							label: "Total Bags Produced",
							data: chartLocations.map(
								(item) => item.totalBagProduced
							),
							backgroundColor: "rgba(54, 162, 235, 0.7)",
						},
						{
							label: "Total KG Used",
							data: chartLocations.map(
								(item) => item.totalKgUsed
							),
							backgroundColor: "rgba(255, 99, 132, 0.7)",
						},
					],
				};

				try {
					const chartImg = await createChartImage(locationChart, {
						plugins: {
							title: {
								display: true,
								text: "Production by Location",
								font: {
									size: 16,
								},
							},
							legend: {
								position: "top",
							},
						},
						responsive: false,
						scales: {
							y: {
								beginAtZero: true,
							},
						},
					});

					const currentY = (pdf as any).lastAutoTable.finalY + 10;

					// Check if there's enough space on the current page
					if (currentY + 80 > pageHeight) {
						pdf.addPage();
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							15,
							pageWidth - 30,
							80
						);
					} else {
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							currentY,
							pageWidth - 30,
							80
						);
					}
				} catch (error) {
					console.error("Error creating location chart:", error);
				}
			}

			// Add page for Supervisor section
			pdf.addPage();

			// By Supervisor section
			pdf.setFontSize(16);
			pdf.text("Analysis by Supervisor", 15, 15);

			// Supervisor table
			autoTable(pdf, {
				startY: 20,
				head: [
					[
						"Supervisor",
						"KG Used",
						"Bag Produced",
						"Bag Sold",
						"Missing Bags",
						"Reports",
						"Each KG Produced",
					],
				],
				body: supervisorArray.map((item) => [
					item.supervisor,
					formatNumber(item.totalKgUsed),
					formatNumber(item.totalBagProduced),
					formatNumber(item.totalBagSold),
					formatNumber(item.totalMissingBag),
					item.count,
					formatNumber(
						safeDivide(item.totalBagProduced, item.totalKgUsed)
					),
				]),
				styles: { fontSize: 10, cellPadding: 3 },
				headStyles: { fillColor: [41, 128, 185], textColor: 255 },
				alternateRowStyles: { fillColor: [245, 245, 245] },
			});

			// Supervisor chart - Production & Sales
			if (supervisorArray.length > 0) {
				// Limit to top 10 supervisors if there are too many
				const chartSupervisors =
					supervisorArray.length > 10
						? supervisorArray
								.sort(
									(a, b) =>
										b.totalBagProduced - a.totalBagProduced
								)
								.slice(0, 10)
						: supervisorArray;

				const supervisorChart = {
					labels: chartSupervisors.map((item) => item.supervisor),
					datasets: [
						{
							label: "Bags Produced",
							data: chartSupervisors.map(
								(item) => item.totalBagProduced
							),
							backgroundColor: "rgba(54, 162, 235, 0.7)",
						},
						{
							label: "Bags Sold",
							data: chartSupervisors.map(
								(item) => item.totalBagSold
							),
							backgroundColor: "rgba(75, 192, 192, 0.7)",
						},
					],
				};

				try {
					const chartImg = await createChartImage(supervisorChart, {
						plugins: {
							title: {
								display: true,
								text: "Production & Sales by Supervisor",
								font: {
									size: 16,
								},
							},
							legend: {
								position: "top",
							},
						},
						responsive: false,
						scales: {
							y: {
								beginAtZero: true,
							},
						},
					});

					const currentY = (pdf as any).lastAutoTable.finalY + 10;

					// Check if there's enough space on the current page
					if (currentY + 80 > pageHeight) {
						pdf.addPage();
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							15,
							pageWidth - 30,
							80
						);
					} else {
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							currentY,
							pageWidth - 30,
							80
						);
					}
				} catch (error) {
					console.error("Error creating supervisor chart:", error);
				}
			}

			// Supervisor Efficiency chart - NEW CHART
			if (supervisorArray.length > 0) {
				// Get current Y position
				const currentY = (pdf as any).lastAutoTable.finalY + 95; // Positioned below the previous chart

				// Check if we need a new page
				if (currentY + 80 > pageHeight) {
					pdf.addPage();
					pdf.setFontSize(16);
					pdf.text("Supervisor Efficiency Analysis", 15, 15);
				} else {
					pdf.setFontSize(16);
					pdf.text(
						"Supervisor Efficiency Analysis",
						15,
						currentY - 5
					);
				}

				// Limit to top 10 supervisors by efficiency if there are too many
				const chartSupervisors =
					supervisorArray.length > 10
						? supervisorArray
								.sort(
									(a, b) =>
										safeDivide(
											b.totalBagProduced,
											b.totalKgUsed
										) -
										safeDivide(
											a.totalBagProduced,
											a.totalKgUsed
										)
								)
								.slice(0, 10)
						: supervisorArray;

				const supervisorEfficiencyChart = {
					labels: chartSupervisors.map((item) => item.supervisor),
					datasets: [
						{
							label: "Efficiency (Bags per KG)",
							data: chartSupervisors.map((item) =>
								safeDivide(
									item.totalBagProduced,
									item.totalKgUsed
								)
							),
							backgroundColor: "rgba(75, 192, 192, 0.7)",
						},
					],
				};

				try {
					const chartImg = await createChartImage(
						supervisorEfficiencyChart,
						{
							plugins: {
								title: {
									display: true,
									text: "Production Efficiency by Supervisor (Bags per KG)",
									font: {
										size: 16,
									},
								},
								legend: {
									position: "top",
								},
							},
							responsive: false,
							scales: {
								y: {
									beginAtZero: true,
								},
							},
						}
					);

					if (currentY + 80 > pageHeight) {
						// Already added a new page above
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							25,
							pageWidth - 30,
							80
						);
					} else {
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							currentY,
							pageWidth - 30,
							80
						);
					}
				} catch (error) {
					console.error(
						"Error creating supervisor efficiency chart:",
						error
					);
				}
			}

			// Add page for Sales Rep section
			pdf.addPage();

			// By Sales Rep section
			pdf.setFontSize(16);
			pdf.text("Analysis by Sales Representative", 15, 15);

			// Sales Rep table
			autoTable(pdf, {
				startY: 20,
				head: [
					[
						"Sales Rep",
						"KG Used",
						"Bag Produced",
						"Bag Sold",
						"Missing Bags",
						"Reports",
						"Each KG Produced",
					],
				],
				body: salesRepArray.map((item) => [
					item.salesRep,
					formatNumber(item.totalKgUsed),
					formatNumber(item.totalBagProduced),
					formatNumber(item.totalBagSold),
					formatNumber(item.totalMissingBag),
					item.count,
					formatNumber(
						safeDivide(item.totalBagProduced, item.totalKgUsed)
					),
				]),
				styles: { fontSize: 10, cellPadding: 3 },
				headStyles: { fillColor: [41, 128, 185], textColor: 255 },
				alternateRowStyles: { fillColor: [245, 245, 245] },
			});

			// Sales Rep chart
			if (salesRepArray.length > 0) {
				// Limit to top 10 sales reps if there are too many
				const chartSalesReps =
					salesRepArray.length > 10
						? salesRepArray
								.sort(
									(a, b) =>
										safeDivide(
											b.totalBagProduced,
											b.totalKgUsed
										) -
										safeDivide(
											a.totalBagProduced,
											a.totalKgUsed
										)
								)
								.slice(0, 10)
						: salesRepArray;

				const salesRepChart = {
					labels: chartSalesReps.map((item) => item.salesRep),
					datasets: [
						{
							label: "KG Efficiency (Bags per KG)",
							data: chartSalesReps.map((item) =>
								safeDivide(
									item.totalBagProduced,
									item.totalKgUsed
								)
							),
							backgroundColor: "rgba(153, 102, 255, 0.7)",
						},
					],
				};

				try {
					const chartImg = await createChartImage(salesRepChart, {
						plugins: {
							title: {
								display: true,
								text: "Production Efficiency by Sales Rep (Bags per KG)",
								font: {
									size: 16,
								},
							},
							legend: {
								position: "top",
							},
						},
						responsive: false,
						scales: {
							y: {
								beginAtZero: true,
							},
						},
					});

					const currentY = (pdf as any).lastAutoTable.finalY + 10;

					// Check if there's enough space on the current page
					if (currentY + 80 > pageHeight) {
						pdf.addPage();
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							15,
							pageWidth - 30,
							80
						);
					} else {
						pdf.addImage(
							chartImg,
							"PNG",
							15,
							currentY,
							pageWidth - 30,
							80
						);
					}
				} catch (error) {
					console.error("Error creating sales rep chart:", error);
				}
			}

			// Final summary page with efficiency comparison
			pdf.addPage();
			pdf.setFontSize(18);
			pdf.text("Efficiency Comparison", 15, 15);

			// Create efficiency comparison data
			const efficiencyData = {
				labels: ["By Location", "By Supervisor", "By Sales Rep"],
				datasets: [
					{
						label: "Average Bags per KG",
						data: [
							locationArray.length
								? locationArray.reduce(
										(sum, item) =>
											sum +
											safeDivide(
												item.totalBagProduced,
												item.totalKgUsed
											),
										0
								  ) / locationArray.length
								: 0,
							supervisorArray.length
								? supervisorArray.reduce(
										(sum, item) =>
											sum +
											safeDivide(
												item.totalBagProduced,
												item.totalKgUsed
											),
										0
								  ) / supervisorArray.length
								: 0,
							salesRepArray.length
								? salesRepArray.reduce(
										(sum, item) =>
											sum +
											safeDivide(
												item.totalBagProduced,
												item.totalKgUsed
											),
										0
								  ) / salesRepArray.length
								: 0,
						],
						backgroundColor: [
							"rgba(54, 162, 235, 0.7)",
							"rgba(75, 192, 192, 0.7)",
							"rgba(153, 102, 255, 0.7)",
						],
					},
				],
			};

			try {
				const chartImg = await createChartImage(efficiencyData, {
					plugins: {
						title: {
							display: true,
							text: "Average Production Efficiency Comparison",
							font: {
								size: 16,
							},
						},
						legend: {
							position: "top",
						},
					},
					responsive: false,
					scales: {
						y: {
							beginAtZero: true,
						},
					},
				});

				pdf.addImage(chartImg, "PNG", 15, 25, pageWidth - 30, 80);
			} catch (error) {
				console.error("Error creating efficiency chart:", error);
			}

			// Add summary text
			pdf.setFontSize(12);
			pdf.text("Summary of Production Metrics:", 15, 120);

			const totalKgUsed = locationArray.reduce(
				(sum, item) => sum + item.totalKgUsed,
				0
			);
			const totalBagProduced = locationArray.reduce(
				(sum, item) => sum + item.totalBagProduced,
				0
			);
			const totalBagSold = locationArray.reduce(
				(sum, item) => sum + item.totalBagSold,
				0
			);
			const efficiency = safeDivide(totalBagProduced, totalKgUsed);

			pdf.text(`• Total KG Used: ${formatNumber(totalKgUsed)}`, 20, 130);
			pdf.text(
				`• Total Bags Produced: ${formatNumber(totalBagProduced)}`,
				20,
				140
			);
			pdf.text(
				`• Total Bags Sold: ${formatNumber(totalBagSold)}`,
				20,
				150
			);
			pdf.text(
				`• Overall Efficiency (Bags per KG): ${formatNumber(
					efficiency
				)}`,
				20,
				160
			);
			pdf.text(`• Total Reports Analyzed: ${reports.length}`, 20, 170);

			// Add report date and footer
			const today = new Date().toLocaleDateString();
			pdf.setFontSize(10);
			pdf.text(`Report generated on ${today}`, 15, 190);

			// Save the PDF
			pdf.save(`Aggregated-Report-Analysis-${today}.pdf`);
		} catch (error) {
			console.error("Error generating PDF:", error);
			alert("There was an error generating the PDF. Please try again.");
		}
	};

	return (
		<Button
			variant="outline"
			disabled={isLoading || reports.length === 0}
			onClick={generatePDF}
			size="sm"
			className="mt-2"
		>
			<Download className="h-4 w-4 mr-2" />
			Export PDF Report
		</Button>
	);
}
