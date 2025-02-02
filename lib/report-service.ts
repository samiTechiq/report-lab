import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Report, User } from '@/types';

const REPORTS_COLLECTION = 'reports';

interface GetReportsParams {
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  filters?: Partial<Report>;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const reportService = {
  async createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...report,
      report_date: report.report_date || new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    return docRef.id;
  },

  async updateReport(id: string, report: Partial<Report>) {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...report,
      report_date: report.report_date ? (report.report_date instanceof Date ? report.report_date : new Date(report.report_date)) : new Date(),
      updated_at: new Date(),
    });
  },

  async deleteReport(id: string) {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getReports({
    pageSize = 10,
    lastDoc,
    filters,
    userId,
    startDate,
    endDate,
  }: GetReportsParams) {
    try {
      let queryConstraints: any[] = [];

      // Add filters first
      if (filters?.location) {
        queryConstraints.push(where('location', '==', filters.location));
      }

      if (userId) {
        queryConstraints.push(where('recorded_by', '==', userId));
      }

      // Add date filter and ordering
      // We'll order by report_date to make the date range filter work
      queryConstraints.push(orderBy('report_date', 'desc'));
      
      if (startDate) {
        queryConstraints.push(where('report_date', '>=', new Date(startDate)));
      }

      if (endDate) {
        queryConstraints.push(where('report_date', '<=', new Date(endDate)));
      }
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      // Add limit last
      queryConstraints.push(limit(pageSize));

      const q = query(collection(db, REPORTS_COLLECTION), ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const reports: Report[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          report_date: data.report_date.toDate(),
          opening_kg: data.opening_kg,
          additional_kg: data.additional_kg,
          kg_used: data.kg_used,
          closing_kg: data.closing_kg,
          opening_bag: data.opening_bag,
          bag_produced: data.bag_produced,
          bag_sold: data.bag_sold,
          closing_bag: data.closing_bag,
          missing_bag: data.missing_bag,
          location: data.location,
          recorded_by: data.recorded_by,
          created_at: data.created_at.toDate(),
          updated_at: data.updated_at.toDate(),
        });
      });

      return {
        reports,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  },

  async getAllFilteredReports({
    filters,
    startDate,
    endDate,
  }: Omit<GetReportsParams, 'pageSize' | 'lastDoc' | 'userId'>) {
    try {
      let queryConstraints: any[] = [];

      // Add filters first
      if (filters?.location) {
        queryConstraints.push(where('location', '==', filters.location));
      }

      // Add date filter and ordering
      queryConstraints.push(orderBy('report_date', 'desc'));
      
      if (startDate) {
        queryConstraints.push(where('report_date', '>=', new Date(startDate)));
      }

      if (endDate) {
        queryConstraints.push(where('report_date', '<=', new Date(endDate)));
      }

      const q = query(collection(db, REPORTS_COLLECTION), ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const reports: Report[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          report_date: data.report_date.toDate(),
          opening_kg: data.opening_kg,
          additional_kg: data.additional_kg,
          kg_used: data.kg_used,
          closing_kg: data.closing_kg,
          opening_bag: data.opening_bag,
          bag_produced: data.bag_produced,
          bag_sold: data.bag_sold,
          closing_bag: data.closing_bag,
          missing_bag: data.missing_bag,
          location: data.location,
          recorded_by: data.recorded_by,
          created_at: data.created_at.toDate(),
          updated_at: data.updated_at.toDate(),
        });
      });

      return reports;
    } catch (error) {
      console.error('Error getting all filtered reports:', error);
      throw error;
    }
  },
};
