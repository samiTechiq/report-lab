// import { db } from "@/lib/firebase"
// import {
//   collection,
//   doc,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   getDocs,
//   query,
//   where,
//   orderBy,
//   limit,
//   startAfter,
//   DocumentData,
//   QueryDocumentSnapshot,
// } from "firebase/firestore"
// import { Report, ReportFormValues } from "@/types/report"

// const COLLECTION_NAME = "reports"

// interface GetReportsOptions {
//   pageSize?: number
//   lastDoc?: QueryDocumentSnapshot<DocumentData> | null
//   filters?: {
//     location?: string
//   }
//   startDate?: string
//   endDate?: string
// }

// class ReportService {
//   async getReports({
//     pageSize = 10,
//     lastDoc = null,
//     filters = {},
//     startDate,
//     endDate,
//   }: GetReportsOptions = {}) {
//     try {
//       let q = query(
//         collection(db, COLLECTION_NAME),
//         orderBy("report_date", "desc"),
//         limit(pageSize)
//       )

//       if (filters.location) {
//         q = query(q, where("location", "==", filters.location))
//       }

//       if (startDate) {
//         q = query(q, where("report_date", ">=", new Date(startDate)))
//       }

//       if (endDate) {
//         q = query(q, where("report_date", "<=", new Date(endDate)))
//       }

//       if (lastDoc) {
//         q = query(q, startAfter(lastDoc))
//       }

//       const snapshot = await getDocs(q)
//       const lastVisible = snapshot.docs[snapshot.docs.length - 1]

//       const reports = snapshot.docs.map((doc) => {
//         const data = doc.data()
//         return {
//           id: doc.id,
//           report_date: data.report_date?.toDate?.() || new Date(),
//           opening_kg: data.opening_kg || "0",
//           additional_kg: data.additional_kg || "0",
//           kg_used: data.kg_used || "0",
//           closing_kg: data.closing_kg || "0",
//           opening_bag: data.opening_bag || "0",
//           bag_produced: data.bag_produced || "0",
//           bag_sold: data.bag_sold || "0",
//           missing_bag: data.missing_bag || "0",
//           closing_bag: data.closing_bag || "0",
//           recorded_by: data.recorded_by || "",
//           opening_stock: data.opening_stock || "0",
//           additional_stock: data.additional_stock || "0",
//           stock_used: data.stock_used || "0",
//           damages: data.damages || "0",
//           closing_stock: data.closing_stock || "0",
//           missing_stock: data.missing_stock || "0",
//           sale_rep: data.sale_rep || "",
//           supervisor: data.supervisor || "",
//           location: data.location || "",
//           createdAt: data.created_at?.toDate?.() || new Date(),
//           updatedAt: data.updated_at?.toDate?.() || new Date(),
//           createdBy: data.created_by || ""
//         } as Report
//       })

//       return {
//         reports,
//         lastDoc: lastVisible,
//         hasMore: snapshot.docs.length === pageSize,
//       }
//     } catch (error) {
//       console.error("Error getting reports:", error)
//       throw error
//     }
//   }

//   async createReport(data: ReportFormValues & { createdBy: string }) {
//     try {
//       const reportData = {
//         ...data,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         report_date: new Date(data.report_date),
//       }

//       const docRef = await addDoc(collection(db, COLLECTION_NAME), reportData)
//       return {
//         id: docRef.id,
//         ...reportData,
//       }
//     } catch (error) {
//       console.error("Error creating report:", error)
//       throw error
//     }
//   }

//   async updateReport(
//     id: string,
//     data: Partial<ReportFormValues> & { updatedBy: string }
//   ) {
//     try {
//       const reportRef = doc(db, COLLECTION_NAME, id)
//       const updateData = {
//         ...data,
//         updatedAt: new Date(),
//         report_date: new Date(data.report_date as string),
//       }
//       await updateDoc(reportRef, updateData)
//     } catch (error) {
//       console.error("Error updating report:", error)
//       throw error
//     }
//   }

//   async deleteReport(id: string) {
//     try {
//       const reportRef = doc(db, COLLECTION_NAME, id)
//       await deleteDoc(reportRef)
//     } catch (error) {
//       console.error("Error deleting report:", error)
//       throw error
//     }
//   }
// }

// export const reportService = new ReportService()
