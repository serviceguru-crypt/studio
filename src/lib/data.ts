

"use client";

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, arrayUnion, setDoc, query, where, documentId, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { z } from 'zod';
import { scoreLead } from '@/ai/flows/score-lead-flow';


// --- TYPE DEFINITIONS ---

export type Role = 'Admin' | 'Sales Rep';
export type Tier = 'Starter' | 'Pro' | 'Enterprise';


export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
    organizationId: string;
    tier?: Tier;
}

export type CompanyProfile = {
    id: string; // This will be the organizationId
    name: string;
    logo: string;
    tier: Tier;
}

export type Lead = {
    id:string;
    name: string;
    email: string;
    organization: string;
    phone?: string;
    source: string;
    createdAt: any;
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
    closeDate: z.any(),
    leadScore: z.enum(['Hot', 'Warm', 'Cold']).optional(),
    justification: z.string().optional(),
    organizationId: z.string(),
    company: z.string().optional(),
    activity: z.array(z.any()).optional(),
});
export type Deal = z.infer<typeof DealSchema>;


export type Activity = {
    id: string;
    date: any;
    type: 'Email' | 'Call' | 'Meeting' | 'Note' | 'Update';
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
    activity: z.array(z.any()).optional(), 
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
export const auth = getAuth(app);

// --- UTILITY FUNCTIONS ---
let authReady = false;
let authPromise: Promise<FirebaseUser | null> | null = null;

const ensureAuthReady = (): Promise<FirebaseUser | null> => {
    if (!authPromise) {
        authPromise = new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                authReady = true;
                resolve(user);
                unsubscribe();
            });
        });
    }
    return authPromise;
};


// Helper to get current user's auth UID and organization ID
async function getCurrentUserAuth() {
    const user = await ensureAuthReady();
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

export async function registerUser(data: { name: string, email: string, password: string, organizationName: string, tier: Tier }): Promise<User> {
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
        tier: data.tier,
    };

    const newCompanyProfile: CompanyProfile = {
        id: organizationId,
        name: data.organizationName,
        logo: '',
        tier: data.tier,
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
    const orgsSnapshot = await getDocs(collection(db, "organizations"));
    let foundUser: User | null = null;
    for (const orgDoc of orgsSnapshot.docs) {
        const userDocRef = doc(db, `organizations/${orgDoc.id}/users`, user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const orgProfile = orgDoc.data() as CompanyProfile;
             if (!orgProfile.tier) {
                // This is an existing user from before tiers were introduced.
                // Upgrade them to Enterprise.
                orgProfile.tier = 'Enterprise';
                await updateDoc(doc(db, "organizations", orgDoc.id), { tier: 'Enterprise' });
            }
            foundUser = {
                ...(userDoc.data() as Omit<User, 'tier'>),
                tier: orgProfile.tier
            };
            localStorage.setItem('organizationId', foundUser.organizationId);
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            return foundUser;
        }
    }
    throw new Error("User record not found in any organization.");
};

export async function signInWithGoogle(): Promise<{ user: User, isNewUser: boolean }> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if the user already exists in any organization
    const orgsSnapshot = await getDocs(collection(db, "organizations"));
    for (const orgDoc of orgsSnapshot.docs) {
        const userDocRef = doc(db, `organizations/${orgDoc.id}/users`, user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const orgProfile = orgDoc.data() as CompanyProfile;
            if (!orgProfile.tier) {
                orgProfile.tier = 'Enterprise';
                 await updateDoc(doc(db, "organizations", orgDoc.id), { tier: 'Enterprise' });
            }
            const existingUser: User = {
                ...(userDoc.data() as Omit<User, 'tier'>),
                tier: orgProfile.tier,
            };
            localStorage.setItem('organizationId', existingUser.organizationId);
            localStorage.setItem('currentUser', JSON.stringify(existingUser));
            return { user: existingUser, isNewUser: false };
        }
    }

    // If user does not exist, it's a new user. Create a new organization and user profile.
    // For Google Sign-In, we will assign Starter tier by default and let them upgrade.
    const organizationId = `org-${Date.now()}`;
    const organizationName = `${user.displayName}'s Organization`;
    const defaultTier = 'Starter';

    const newUser: User = {
        id: user.uid,
        name: user.displayName || 'New User',
        email: user.email!,
        role: 'Admin',
        avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
        organizationId: organizationId,
        tier: defaultTier
    };

    const newCompanyProfile: CompanyProfile = {
        id: organizationId,
        name: organizationName,
        logo: user.photoURL || '',
        tier: defaultTier,
    };

    const batch = writeBatch(db);
    
    const orgDocRef = doc(db, "organizations", organizationId);
    batch.set(orgDocRef, newCompanyProfile);

    const userDocRef = doc(db, `organizations/${organizationId}/users`, user.uid);
    batch.set(userDocRef, newUser);
    
    await batch.commit();

    localStorage.setItem('organizationId', organizationId);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return { user: newUser, isNewUser: true };
}


export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

export async function sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
    await signOut(auth);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('organizationId');
    authPromise = null;
}

// --- COMPANY PROFILE FUNCTIONS ---

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, 'organizations', organizationId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as CompanyProfile : null;
}

export async function updateCompanyProfile(profile: Partial<CompanyProfile>): Promise<void> {
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, 'organizations', organizationId);
    await updateDoc(docRef, profile);
}

// --- CUSTOMER FUNCTIONS ---

export async function getCustomers(): Promise<Customer[]> {
    const { organizationId } = await getCurrentUserAuth();
    const customersCol = collection(db, `organizations/${organizationId}/customers`);
    const snapshot = await getDocs(customersCol);
    return snapshot.docs.map(d => CustomerSchema.parse({ id: d.id, ...d.data() }));
};

export async function addCustomer(customerData: Omit<Customer, 'id' | 'activity' | 'organizationId' | 'ownerId'>): Promise<Customer> {
    const { uid, organizationId } = await getCurrentUserAuth();
    const customersCol = collection(db, `organizations/${organizationId}/customers`);
    const docRef = await addDoc(customersCol, {
        ...customerData,
        ownerId: uid,
        organizationId,
        avatar: `https://i.pravatar.cc/150?u=${customerData.email}`,
        status: "Active"
    });
    const newCustomer = await getDoc(docRef);
    return CustomerSchema.parse({ id: newCustomer.id, ...newCustomer.data() });
};

export async function getCustomerById(id: string): Promise<Customer | undefined> {
    const { organizationId } = await getCurrentUserAuth();
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
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/customers`, id);
    await updateDoc(docRef, updatedData);
};

export async function deleteCustomer(id: string): Promise<void> {
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/customers`, id);
    await deleteDoc(docRef);
};

// --- DEAL FUNCTIONS ---

export async function getDeals(): Promise<Deal[]> {
    const { organizationId } = await getCurrentUserAuth();
    const dealsCol = collection(db, `organizations/${organizationId}/deals`);
    const snapshot = await getDocs(dealsCol);
    
    // Fetch related customers to populate company name
    const customerIds = [...new Set(snapshot.docs.map(d => d.data().customerId))].filter(Boolean);
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
            closeDate: data.closeDate?.toDate ? data.closeDate.toDate() : new Date(),
            company: customer?.organization || 'N/A'
        });
    });
};

export async function addDeal(dealData: Omit<Deal, 'id' | 'organizationId' | 'ownerId'>): Promise<Deal> {
    const { uid, organizationId } = await getCurrentUserAuth();
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
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/deals`, id);
    const docSnap = await getDoc(docRef);
     if (!docSnap.exists()) return undefined;

    const data = docSnap.data();
    const deal = DealSchema.parse({ 
        id: docSnap.id, 
        ...data,
        closeDate: data?.closeDate?.toDate ? data.closeDate.toDate() : new Date(),
    });

    const activityCol = collection(db, `organizations/${organizationId}/deals/${id}/activity`);
    const activitySnap = await getDocs(activityCol);
    deal.activity = activitySnap.docs.map(d => ({
        id: d.id, 
        ...d.data(),
        date: d.data().date?.toDate ? d.data().date.toDate() : new Date(),
    })) as Activity[];

    return deal;
}

export async function updateAndRescoreDeal(dealId: string, oldData: Deal, newData: Partial<Deal>): Promise<void> {
    const { organizationId } = await getCurrentUserAuth();
    const dealRef = doc(db, `organizations/${organizationId}/deals`, dealId);
    
    // Create activity logs for changes
    const activityLogs: string[] = [];
    if (newData.stage && newData.stage !== oldData.stage) {
        activityLogs.push(`Deal stage changed from ${oldData.stage} to ${newData.stage}.`);
    }
    if (newData.value !== undefined && newData.value !== oldData.value) {
        activityLogs.push(`Deal value updated from ₦${oldData.value.toLocaleString()} to ₦${newData.value.toLocaleString()}.`);
    }
    
    const updatedDealData: Partial<Deal> = { ...newData };

    // Re-score the lead if stage or value has changed
    const needsRescoring = newData.stage || newData.value;
    if (needsRescoring) {
        const customer = await getCustomerById(oldData.customerId);
        if (customer) {
            const scoreResult = await scoreLead({
                dealName: oldData.name,
                organizationName: customer.organization,
                dealValue: newData.value ?? oldData.value,
                stage: newData.stage ?? oldData.stage,
            });
            updatedDealData.leadScore = scoreResult.leadScore;
            updatedDealData.justification = scoreResult.justification;
            activityLogs.push(`Lead score updated to ${scoreResult.leadScore}. Justification: ${scoreResult.justification}`);
        }
    }

    const batch = writeBatch(db);
    batch.update(dealRef, updatedDealData);

    // Add all activity logs
    activityLogs.forEach(log => {
        const activityRef = doc(collection(db, `organizations/${organizationId}/deals/${dealId}/activity`));
        batch.set(activityRef, {
            date: new Date(),
            type: 'Update',
            notes: log,
        });
    });

    await batch.commit();
}


export async function updateDeal(id: string, updatedData: Partial<Omit<Deal, 'id'>>): Promise<void> {
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/deals`, id);
    // Firestore cannot store undefined, so we need to remove keys with undefined values
    Object.keys(updatedData).forEach(key => updatedData[key as keyof typeof updatedData] === undefined && delete updatedData[key as keyof typeof updatedData]);
    await updateDoc(docRef, updatedData);
};

export async function deleteDeal(id: string): Promise<void> {
    const { organizationId } = await getCurrentUserAuth();
    const docRef = doc(db, `organizations/${organizationId}/deals`, id);
    await deleteDoc(docRef);
};

// --- ACTIVITY FUNCTIONS ---

export async function addActivity(customerId: string, activityData: Omit<Activity, 'id' | 'date'>): Promise<void> {
    const { organizationId } = await getCurrentUserAuth();
    const activityCol = collection(db, `organizations/${organizationId}/customers/${customerId}/activity`);
    await addDoc(activityCol, {
        ...activityData,
        date: new Date()
    });
}

// --- LEAD FUNCTIONS ---

export async function getLeads(): Promise<Lead[]> {
    const { organizationId } = await getCurrentUserAuth();
    const leadsCol = collection(db, `organizations/${organizationId}/leads`);
    const snapshot = await getDocs(leadsCol);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt.toDate()
    } as Lead));
}

export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status' | 'ownerId' | 'organizationId'>): Promise<Lead> {
    const { uid, organizationId } = await getCurrentUserAuth();
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

export async function convertLeadToCustomer(lead: Lead): Promise<{ customerId: string, dealId: string }> {
    const { uid, organizationId } = await getCurrentUserAuth();
    
    const batch = writeBatch(db);

    // 1. Create a new Customer
    const customerRef = doc(collection(db, `organizations/${organizationId}/customers`));
    const newCustomerData = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        organization: lead.organization,
        status: 'Active',
        avatar: `https://i.pravatar.cc/150?u=${lead.email}`,
        ownerId: uid,
        organizationId,
    };
    batch.set(customerRef, newCustomerData);

    // 2. Create a new Deal for that Customer
    const dealRef = doc(collection(db, `organizations/${organizationId}/deals`));
    const newDealData = {
        name: `Initial Deal for ${lead.organization}`,
        stage: 'Qualification',
        value: 0, // Initial value, can be updated later
        customerId: customerRef.id,
        ownerId: uid,
        organizationId,
        closeDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Set a default close date 30 days out
    };
    batch.set(dealRef, newDealData);
    
    // 3. Delete the Lead
    const leadRef = doc(db, `organizations/${organizationId}/leads`, lead.id);
    batch.delete(leadRef);

    // 4. Commit all operations
    await batch.commit();

    return {
        customerId: customerRef.id,
        dealId: dealRef.id,
    };
}


// This is a placeholder for your actual dashboard data sources
export const salesData = [];
export const revenueData = [];
export const leadsData = [];
export const recentSales = [];
export const teamPerformance = [];
export const leadsSourceData = [];

    
