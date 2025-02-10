import { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from 'firebase/auth';
import { db, auth } from '../firebase';
import { User, CreateUserInput, UpdateUserInput } from '@/types/user';

const USERS_COLLECTION = 'users';

const userConverter = {
  toFirestore: (user: User): DocumentData => {
    return {
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): User => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
      status: data.status,
      role: data.role,
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null,
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null,
    };
  },
};

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      console.log('Getting users from collection:', USERS_COLLECTION);
      const usersRef = collection(db, USERS_COLLECTION).withConverter(userConverter);
      const snapshot = await getDocs(usersRef);
      // console.log('Snapshot size:', snapshot.size);
      // console.log('Raw snapshot data:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
      const users = snapshot.docs.map(doc => userConverter.fromFirestore(doc));
      // console.log('Converted users:', users);
      return users;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, id).withConverter(userConverter);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? userConverter.fromFirestore(snapshot) : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const usersRef = collection(db, USERS_COLLECTION).withConverter(userConverter);
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    return !snapshot.empty ? userConverter.fromFirestore(snapshot.docs[0]) : null;
  },

  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Create the auth user first
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        input.email,
        input.password
      );

      // Then create the user document in Firestore
      const userDoc = doc(db, USERS_COLLECTION, userCredential.user.uid);
      const userData = {
        name: input.name,
        email: input.email,
        status: input.status,
        role: input.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDoc, userData);

      return {
        id: userCredential.user.uid,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(userRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteUser(id: string): Promise<void> {
    try {
      // Delete from Firestore first
      const userRef = doc(db, USERS_COLLECTION, id);
      await deleteDoc(userRef);
      
      // Then delete the auth user if it exists
      if (auth.currentUser) {
        try {
          await deleteAuthUser(auth.currentUser);
        } catch (authError) {
          console.error('Error deleting auth user:', authError);
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete user');
    }
  },
};
