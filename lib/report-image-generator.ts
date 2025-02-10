import { Report } from "@/types/report";
import { subStr } from "./utils";

export const generateReportImage = async (report: Report): Promise<string> => {
  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Set canvas dimensions
  canvas.width = 500;
  canvas.height = 750;

  // Set background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set text styles for header
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";

  // Draw header
  ctx.fillText("Manager's Report", canvas.width / 2, 50);

  // Helper function to format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Define field labels and values
  const fields = [
    { label: "Report Date", value: formatDate(report.report_date) },
    { label: "Opening KG", value: report.opening_kg },
    { label: "Additional KG", value: report.additional_kg },
    { label: "KG Used", value: report.kg_used },
    { label: "Closing KG", value: report.closing_kg },
    { label: "Each kg produced", value: report?.each_kg_produced },
    { label: "Opening Bag", value: report.opening_bag },
    { label: "Bag Produced", value: report.bag_produced },
    { label: "Bag Sold", value: report.bag_sold },
    { label: "Closing Bag", value: report.closing_bag },
    { label: "Missing Bag", value: report.missing_bag },
    { label: "Damage Bag", value: report?.damage_stock },
    { label: "Location", value: report.location },
    { label: "Sales Rep", value: report.sales_rep },
    { label: "Supervisor", value: report.supervisor },
    { label: "Recorded By", value: subStr(report.recorded_by, 25) },
  ];

  // Layout configuration
  const startY = 100;
  const lineHeight = 40;
  const leftMargin = 40;
  const rightMargin = 40;
  const labelWidth = 150;
  const separatorColor = "#E5E7EB"; // Light gray color for separators
  const contentWidth = canvas.width - leftMargin - rightMargin;
  const valueX = leftMargin + labelWidth + 20; // Add some padding between label and value

  // Draw fields
  fields.forEach((field, index) => {
    const y = startY + index * lineHeight;

    // Draw label (right-aligned)
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "right";
    ctx.fillText(`${field.label}:`, leftMargin + labelWidth, y);

    // Draw value (left-aligned)
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${field.value}`, valueX, y);

    // Draw separator line
    if (index < fields.length - 1) {
      // Don't draw line after last item
      ctx.beginPath();
      ctx.strokeStyle = separatorColor;
      ctx.lineWidth = 1;
      ctx.moveTo(leftMargin, y + lineHeight / 2);
      ctx.lineTo(canvas.width - rightMargin, y + lineHeight / 2);
      ctx.stroke();
    }
  });

  // Draw border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Convert canvas to data URL
  return canvas.toDataURL("image/png");
};

export const downloadReportImage = async (report: Report) => {
  try {
    const dataUrl = await generateReportImage(report);

    // Create download link
    const link = document.createElement("a");
    link.download = `report-${report.id}-${
      new Date().toISOString().split("T")[0]
    }.png`;
    link.href = dataUrl;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating report image:", error);
    throw error;
  }
};
