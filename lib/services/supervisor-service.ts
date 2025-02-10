import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { Supervisor, CreateSupervisorInput, UpdateSupervisorInput } from '@/types/supervisor';

const COLLECTION_NAME = 'supervisors';

export const supervisorService = {
  async getSupervisors(): Promise<Supervisor[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    })) as Supervisor[];
  },

  async createSupervisor(input: CreateSupervisorInput): Promise<Supervisor> {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...input,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: docRef.id,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateSupervisor(id: string, input: UpdateSupervisorInput): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...input,
      updatedAt: new Date(),
    });
  },

  async deleteSupervisor(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },
};
