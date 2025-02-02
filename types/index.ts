export interface Report {
  id: string;
  report_date: Date;
  opening_kg: string;
  additional_kg: string;
  kg_used: string;
  closing_kg: string;
  opening_bag: string;
  bag_produced: string;
  bag_sold: string;
  closing_bag: string;
  missing_bag: string;
  location: string;
  recorded_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}
