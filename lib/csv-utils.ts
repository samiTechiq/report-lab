import { Report } from "@/types/report"

export interface ReportCSVData {
  "Report Date": string;
  "Location": string;
  "Opening KG": string;
  "Additional KG": string;
  "KG Used": string;
  "Closing KG": string;
  "Each KG Produced": string;
  "Opening Bag": string;
  "Bag Produced": string;
  "Bag Sold": string;
  "Missing Bag": string;
  "Closing Bag": string;
  "Opening Stock": string;
  "Additional Stock": string;
  "Stock Used": string;
  "Damage Stock": string;
  "Closing Stock": string;
  "Missing Stock": string;
  "Sales Rep": string;
  "Supervisor": string;
  "Recorded By": string;
  "Created At": string;
  "Updated At": string;
}

export const exportReportsToCSV = (reports: Report[]) => {
  // Convert reports to CSV format
  const csvData = reports.map(report => ({
    "Report Date": report.report_date ? new Date(report.report_date).toLocaleDateString() : '',
    "Location": report.location || '',
    "Opening KG": report.opening_kg || '',
    "Additional KG": report.additional_kg || '',
    "KG Used": report.kg_used || '',
    "Closing KG": report.closing_kg || '',
    "Each KG Produced": report.each_kg_produced || '',
    "Opening Bag": report.opening_bag || '',
    "Bag Produced": report.bag_produced || '',
    "Bag Sold": report.bag_sold || '',
    "Missing Bag": report.missing_bag || '',
    "Closing Bag": report.closing_bag || '',
    "Opening Stock": report.opening_stock || '',
    "Additional Stock": report.additional_stock || '',
    "Stock Used": report.stock_used || '',
    "Damage Stock": report.damage_stock || '',
    "Closing Stock": report.closing_stock || '',
    "Missing Stock": report.missing_stock || '',
    "Sales Rep": report.sales_rep || '',
    "Supervisor": report.supervisor || '',
    "Recorded By": report.recorded_by || '',
    "Created At": report.created_at ? new Date(report.created_at).toLocaleDateString() : '',
    "Updated At": report.updated_at ? new Date(report.updated_at).toLocaleDateString() : '',
  }));

  // Create CSV string
  const headers = Object.keys(csvData[0]);
  const rows = csvData.map(obj => 
    headers.map(header => {
      const value = (obj as unknown as { [key: string]: string })[header];
      // Escape values containing commas by wrapping in quotes
      return value.toString().includes(',') ? `"${value}"` : value;
    })
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

export const importReportsFromCSV = async (file: File): Promise<Partial<Report>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        const reports: Partial<Report>[] = lines.slice(1).map(line => {
          // Handle quoted values containing commas
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue);

          const report: Partial<Report> = {};
          headers.forEach((header, index) => {
            const value = values[index]?.trim();
            switch(header) {
              case "Report Date":
                report.report_date = value ? new Date(value) : new Date();
                break;
              case "Location":
                report.location = value || '';
                break;
              case "Opening KG":
                report.opening_kg = value ? parseFloat(value) : 0;
                break;
              case "Additional KG":
                report.additional_kg = value ? parseFloat(value) : 0;
                break;
              case "KG Used":
                report.kg_used = value ? parseFloat(value) : 0;
                break;
              case "Closing KG":
                report.closing_kg = value ? parseFloat(value) : 0;
                break;
              case "Each KG Produced":
                report.each_kg_produced = value ? parseFloat(value) : 0;
                break;
              case "Opening Bag":
                report.opening_bag = value ? parseFloat(value) : 0;
                break;
              case "Bag Produced":
                report.bag_produced = value ? parseFloat(value) : 0;
                break;
              case "Bag Sold":
                report.bag_sold = value ? parseFloat(value) : 0;
                break;
              case "Missing Bag":
                report.missing_bag = value ? parseFloat(value) : 0;
                break;
              case "Closing Bag":
                report.closing_bag = value ? parseFloat(value) : 0;
                break;
              case "Opening Stock":
                report.opening_stock = value ? parseFloat(value) : 0;
                break;
              case "Additional Stock":
                report.additional_stock = value ? parseFloat(value) : 0;
                break;
              case "Stock Used":
                report.stock_used = value ? parseFloat(value) : 0;
                break;
              case "Damage Stock":
                report.damage_stock = value ? parseFloat(value) : 0;
                break;
              case "Closing Stock":
                report.closing_stock = value ? parseFloat(value) : 0;
                break;
              case "Missing Stock":
                report.missing_stock = value ? parseFloat(value) : 0;
                break;
              case "Sales Rep":
                report.sales_rep = value || '';
                break;
              case "Supervisor":
                report.supervisor = value || '';
                break;
              case "Recorded By":
                report.recorded_by = value || '';
                break;
            }
          });
          
          return report;
        });
        
        resolve(reports);
      } catch (error) {
        reject(new Error('Failed to parse CSV file. Please ensure the file format is correct.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the CSV file.'));
    };
    
    reader.readAsText(file);
  });
}
