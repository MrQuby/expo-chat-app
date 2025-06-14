import { 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Firestore service functions
export const firestoreService = {
  // Create or set a document
  setDocument: async (collectionName, docId, data) => {
    try {
      await setDoc(doc(db, collectionName, docId), data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Add a new document (auto-generated ID)
  addDocument: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get a single document
  getDocument: async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: new Error('Document not found') };
      }
    } catch (error) {
      return { success: false, error };
    }
  },

  // Update a document
  updateDocument: async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Delete a document
  deleteDocument: async (collectionName, docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get all documents from a collection
  getCollection: async (collectionName, queryOptions = {}) => {
    try {
      let q = collection(db, collectionName);
      
      // Apply query options
      if (queryOptions.where) {
        q = query(q, where(queryOptions.where.field, queryOptions.where.operator, queryOptions.where.value));
      }
      
      if (queryOptions.orderBy) {
        q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
      }
      
      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }

      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Listen to real-time updates on a document
  onDocumentSnapshot: (collectionName, docId, callback) => {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, callback);
  },

  // Listen to real-time updates on a collection
  onCollectionSnapshot: (collectionName, callback, queryOptions = {}) => {
    let q = collection(db, collectionName);
    
    // Apply query options
    if (queryOptions.where) {
      q = query(q, where(queryOptions.where.field, queryOptions.where.operator, queryOptions.where.value));
    }
    
    if (queryOptions.orderBy) {
      q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
    }
    
    if (queryOptions.limit) {
      q = query(q, limit(queryOptions.limit));
    }

    return onSnapshot(q, callback);
  },

  // User-specific helper functions
  users: {
    create: async (userId, userData) => {
      return await firestoreService.setDocument('users', userId, {
        ...userData,
        createdAt: new Date().toISOString()
      });
    },

    get: async (userId) => {
      return await firestoreService.getDocument('users', userId);
    },

    update: async (userId, userData) => {
      return await firestoreService.updateDocument('users', userId, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    },

    delete: async (userId) => {
      return await firestoreService.deleteDocument('users', userId);
    }
  }
}; 