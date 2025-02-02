import { Report } from "@/types"

export interface ReportCSVData {
  "Report Date": string;
  "Location": string;
  "Opening KG": string;
  "Additional KG": string;
  "KG Used": string;
  "Closing KG": string;
  "Opening Bag": string;
  "Bag Produced": string;
  "Bag Sold": string;
  "Closing Bag": string;
  "Missing Bag": string;
  "Created At": string;
  "Updated At": string;
}

export const exportReportsToCSV = (reports: Report[]) => {
  // Convert reports to CSV format
  const csvData = reports.map(report => ({
    "Report Date": report.report_date.toLocaleDateString(),
    "Location": report.location,
    "Opening KG": report.opening_kg,
    "Additional KG": report.additional_kg,
    "KG Used": report.kg_used,
    "Closing KG": report.closing_kg,
    "Opening Bag": report.opening_bag,
    "Bag Produced": report.bag_produced,
    "Bag Sold": report.bag_sold,
    "Closing Bag": report.closing_bag,
    "Missing Bag": report.missing_bag,
    "Created At": report.created_at.toLocaleDateString(),
    "Updated At": report.updated_at.toLocaleDateString(),
  }));

  // Create CSV string
  const headers = Object.keys(csvData[0]);
  const rows = csvData.map(obj => 
    headers.map(header => (obj as { [key: string]: string })[header])
  );
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reports-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
