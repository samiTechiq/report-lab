export interface ReportFormValues {
  id?: string;
  opening_kg: number;
  additional_kg: number;
  kg_used: number;
  closing_kg: number;
  damage_kg: number;
  each_kg_produced: number;
  opening_bag: number;
  bag_produced: number;
  bag_sold: number;
  missing_bag: number;
  closing_bag: number;
  recorded_by: string;
  opening_stock: number;
  additional_stock: number;
  stock_used: number;
  damage_stock: number;
  closing_stock: number;
  missing_stock: number;
  sales_rep: string;
  supervisor: string;
  location: string;
  report_date: Date;
}

export interface Report extends ReportFormValues {
  id: string;
  created_at: Date;
  updated_at: Date;
  createdBy?: string;
  updated_by: string;
}
