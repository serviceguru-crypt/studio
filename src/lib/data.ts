
"use client";

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, arrayUnion, setDoc, query, where, documentId, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { z } from 'zod';


// --- TYPE DEFINITIONS ---

export type Role = 'Admin' | 'Sales Rep';

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
    organizationId: string;
}

export type CompanyProfile = {
    id: string; // This will be the organizationId
    name: string;
    logo: string;
}

export type Lead = {
    id: string;
    name: string;
    email: string;
    organization: string;
    phone?: string;
    createdAt: Date;
    status: 'New' | 'Contacted' | 'Qualified' | 'Disqualified';
    ownerId: string; // The user who created the lead
    organizationId: string;
}

export const DealSchema = z.object({
    id: z.string(),
    name: z.string(),
    stage: z.enum(['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
    value: z.number(),
    customerId: z.string(),
    ownerId: z.string(),
    closeDate: z.date(),
    leadScore: z.enum(['Hot', 'Warm', 'Cold']).optional(),
    justification: z.string().optional(),
    organizationId: z.string(),
    company: z.string().optional(),
});
export type Deal = z.infer<typeof DealSchema>;


export type Activity = {
    id: string;
    date: Date;
    type: 'Email' | 'Call' | 'Meeting' | 'Note';
    notes: string;
}

export const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    organization: z.string(),
    status: z.enum(['Active', 'Inactive']),
    avatar: z.string(),
    activity: z.array(z.any()).optional(), // Activity is a subcollection, so we won't store it here directly
    ownerId: z.string(),
    organizationId: z.string(),
})
export type Customer = z.infer<typeof CustomerSchema>;


// --- FIREBASE INITIALIZATION ---

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// --- UTILITY FUNCTIONS ---

// Helper to get current user's auth UID and organization ID
function getCurrentUserAuth() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Not authenticated. Please log in.");
    }
    const organizationId = localStorage.getItem('organizationId');
    if (!organizationId) {
        throw new Error("Organization ID not found. Please log in again.");
    }
    return { uid: user.uid, organizationId };
}


// --- AUTH FUNCTIONS ---

export async function registerUser(data: { name: string, email: string, password: string, organizationName: string }): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    const organizationId = `org-${Date.now()}`;

    const newUser: User = {
        id: user.uid,
        name: data.name,
        email: data.email,
        role: 'Admin',
        avatar: `https://i.pravatar.cc/150?u=${data.email}`,
        organizationId: organizationId,
    };

    const newCompanyProfile: CompanyProfile = {
        id: organizationId,
        name: data.organizationName,
        logo: '',
    };
    
    // Use a batch to write all initial data atomically
    const batch = writeBatch(db);
    
    const orgDocRef = doc(db, "organizations", organizationId);
    batch.set(orgDocRef, newCompanyProfile);

    const userDocRef = doc(db, `organizations/${organizationId}/users`, user.uid);
    batch.set(userDocRef, newUser);
    
    await batch.commit();

    localStorage.setItem('organizationId', organizationId);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return newUser;
};

export async function loginUser(email: string, password: string): Promise<User | null> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // After login, we need to find which organization this user belongs to.
    const usersCollectionRef = collection(db, "users_flat"); // A flat collection for faster lookups
    const q = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
       // This part is a fallback, creating a flat collection of users for easier lookup
       // In a real scenario, you might have a different way to associate users to orgs on login
        const orgsSnapshot = await getDocs(collection(db, "organizations"));
        let foundUser: User | null = null;
        for (const orgDoc of orgsSnapshot.docs) {
            const userDocRef = doc(db, `organizations/${orgDoc.id}/users`, user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                foundUser = userDoc.data() as User;
                await setDoc(doc(db, "users_flat", user.uid), { email: foundUser.email, organizationId: foundUser.organizationId });
                localStorage.setItem('organizationId', foundUser.organizationId);
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                return foundUser;
            }
        }
        throw new Error("User record not found in any organization.");
    }

    const userData = querySnapshot.docs[0].data();
    const userDocRef = doc(db, `organizations/${userData.organizationId}/users`, user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
         throw new Error("User record not found in their organization.");
    }
    const fullUser = userDoc.data() as User;
    localStorage.setItem('organizationId', fullUser.organizationId);
    localStorage.setItem('currentUser', JSON.stringify(fullUser));
    return fullUser;
};

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

export async function logoutUser() {
    await signOut(auth);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('organizationId');
}

// --- COMPANY PROFILE FUNCTIONS ---

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, 'organizations', organizationId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as CompanyProfile : null;
}

export async function updateCompanyProfile(profile: Partial<CompanyProfile>): Promise<void> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, 'organizations', organizationId);
    await updateDoc(docRef, profile);
}

// --- CUSTOMER FUNCTIONS ---

export async function getCustomers(): Promise<Customer[]> {
    const { organizationId } = getCurrentUserAuth();
    const customersCol = collection(db, `organizations/${organizationId}/customers`);
    const snapshot = await getDocs(customersCol);
    return snapshot.docs.map(d => CustomerSchema.parse({ id: d.id, ...d.data() }));
};

export async function addCustomer(customerData: Omit<Customer, 'id' | 'activity'>): Promise<Customer> {
    const { uid, organizationId } = getCurrentUserAuth();
    const customersCol = collection(db, `organizations/${organizationId}/customers`);
    const docRef = await addDoc(customersCol, {
        ...customerData,
        ownerId: uid,
        organizationId,
    });
    const newCustomer = await getDoc(docRef);
    return CustomerSchema.parse({ id: newCustomer.id, ...newCustomer.data() });
};

export async function getCustomerById(id: string): Promise<Customer | undefined> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/customers`, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;

    const customer = CustomerSchema.parse({ id: docSnap.id, ...docSnap.data() });

    // Fetch activities subcollection
    const activityCol = collection(db, `organizations/${organizationId}/customers/${id}/activity`);
    const activitySnap = await getDocs(activityCol);
    customer.activity = activitySnap.docs.map(d => ({id: d.id, ...d.data()})) as Activity[];

    return customer;
}

export async function updateCustomer(id: string, updatedData: Partial<Omit<Customer, 'id'>>): Promise<void> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/customers`, id);
    await updateDoc(docRef, updatedData);
};

export async function deleteCustomer(id: string): Promise<void> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/customers`, id);
    await deleteDoc(docRef);
};

// --- DEAL FUNCTIONS ---

export async function getDeals(): Promise<Deal[]> {
    const { organizationId } = getCurrentUserAuth();
    const dealsCol = collection(db, `organizations/${organizationId}/deals`);
    const snapshot = await getDocs(dealsCol);
    
    // Fetch related customers to populate company name
    const customerIds = [...new Set(snapshot.docs.map(d => d.data().customerId))];
    let customersById: Map<string, Customer> = new Map();

    if(customerIds.length > 0) {
        const customersQuery = query(collection(db, `organizations/${organizationId}/customers`), where(documentId(), 'in', customerIds));
        const customersSnapshot = await getDocs(customersQuery);
        customersSnapshot.docs.forEach(doc => {
            customersById.set(doc.id, {id: doc.id, ...doc.data()} as Customer)
        });
    }

    return snapshot.docs.map(d => {
        const data = d.data();
        const customer = customersById.get(data.customerId);
        return DealSchema.parse({ 
            id: d.id, 
            ...data, 
            closeDate: data.closeDate.toDate(),
            company: customer?.organization || 'N/A'
        });
    });
};

export async function addDeal(dealData: Omit<Deal, 'id' | 'organizationId' | 'ownerId'>): Promise<Deal> {
    const { uid, organizationId } = getCurrentUserAuth();
    const dealsCol = collection(db, `organizations/${organizationId}/deals`);
    const docRef = await addDoc(dealsCol, {
        ...dealData,
        ownerId: uid,
        organizationId
    });
    const newDealSnap = await getDoc(docRef);
    const data = newDealSnap.data();
    return DealSchema.parse({
        id: newDealSnap.id,
        ...data,
        closeDate: data?.closeDate.toDate()
    });
};

export async function getDealById(id: string): Promise<Deal | undefined> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/deals`, id);
    const docSnap = await getDoc(docRef);
     if (!docSnap.exists()) return undefined;
    const data = docSnap.data();
    return DealSchema.parse({
        id: docSnap.id,
        ...data,
        closeDate: data?.closeDate.toDate()
    });
}

export async function updateDeal(id: string, updatedData: Partial<Omit<Deal, 'id'>>): Promise<void> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/deals`, id);
    // Firestore cannot store undefined, so we need to remove keys with undefined values
    Object.keys(updatedData).forEach(key => updatedData[key as keyof typeof updatedData] === undefined && delete updatedData[key as keyof typeof updatedData]);
    await updateDoc(docRef, updatedData);
};

export async function deleteDeal(id: string): Promise<void> {
    const { organizationId } = getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/deals`, id);
    await deleteDoc(docRef);
};

// --- ACTIVITY FUNCTIONS ---

export async function addActivity(customerId: string, activityData: Omit<Activity, 'id' | 'date'>): Promise<void> {
    const { organizationId } = getCurrentUserAuth();
    const activityCol = collection(db, `organizations/${organizationId}/customers/${customerId}/activity`);
    await addDoc(activityCol, {
        ...activityData,
        date: new Date()
    });
}

// --- LEAD FUNCTIONS ---

export async function getLeads(): Promise<Lead[]> {
    const { organizationId } = getCurrentUserAuth();
    const leadsCol = collection(db, `organizations/${organizationId}/leads`);
    const snapshot = await getDocs(leadsCol);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt.toDate()
    } as Lead));
}

export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status' | 'ownerId' | 'organizationId'>): Promise<Lead> {
    const { uid, organizationId } = getCurrentUserAuth();
    const leadsCol = collection(db, `organizations/${organizationId}/leads`);
    
    const newLeadData = {
        ...leadData,
        createdAt: new Date(),
        status: 'New' as const,
        ownerId: uid,
        organizationId,
    }

    const docRef = await addDoc(leadsCol, newLeadData);
    
    return {
        id: docRef.id,
        ...newLeadData
    }
}

// This is a placeholder for your actual dashboard data sources
export const salesData = [];
export const revenueData = [];
export const leadsData = [];
export const recentSales = [];
export const teamPerformance = [];
export const leadsSourceData = [];

    