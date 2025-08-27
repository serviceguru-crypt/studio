// This file will contain all the functions to interact with the Firebase Firestore database.
// We will replace the localStorage logic with actual Firebase SDK calls.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
    id: string;
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
    ownerId: string;
    organizationId: string;
}

export type Deal = {
    id: string;
    name:string;
    stage: 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    value: number;
    customerId: string;
    ownerId: string;
    closeDate: Date;
    leadScore?: 'Hot' | 'Warm' | 'Cold';
    justification?: string;
    organizationId: string;
    company?: string;
}

export type Activity = {
    id: string;
    date: Date;
    type: 'Email' | 'Call' | 'Meeting' | 'Note';
    notes: string;
}

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization: string;
    status: 'Active' | 'Inactive';
    avatar: string;
    activity: Activity[];
    ownerId: string;
    organizationId: string;
}

// --- FIREBASE INITIALIZATION ---

// Your web app's Firebase configuration will be stored in environment variables
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


// --- MOCK DATA (For UI development without real data) ---
// These will be removed as we implement the Firestore functions.
export const salesData: any[] = [];
export const revenueData: any[] = [];
export const leadsSourceData: { name: string; count: number; fill: string }[] = [
    { name: 'Social Media', count: 25, fill: 'var(--color-chart-1)' },
    { name: 'Website', count: 35, fill: 'var(--color-chart-2)' },
    { name: 'Referral', count: 15, fill: 'var(--color-chart-3)' },
    { name: 'Advertisement', count: 20, fill: 'var(--color-chart-4)' },
    { name: 'Email', count: 5, fill: 'var(--color-chart-5)' },
];
export const recentSales: any[] = [];
export const teamPerformance: any[] = [];


// --- AUTH FUNCTIONS ---

export async function registerUser(data: {name: string, email: string, password: string, organizationName: string }): Promise<User> {
    // TODO: Implement Firebase Auth user creation and Firestore document creation.
    console.log("registerUser called with:", data);
    // This is a placeholder.
    return Promise.reject("Function not implemented.");
};

export async function loginUser(email: string, password: string): Promise<User | null> {
    // TODO: Implement Firebase Auth sign-in.
    console.log("loginUser called with:", email);
    // This is a placeholder.
    return Promise.reject("Function not implemented.");
};

export function getCurrentUser(): User | null {
    // This will be replaced with Firebase Auth's onAuthStateChanged listener in the UI.
    return null;
}

// --- COMPANY PROFILE FUNCTIONS ---

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
    // TODO: Implement Firestore document fetch.
    return Promise.reject("Function not implemented.");
}

export async function updateCompanyProfile(profile: CompanyProfile): Promise<void> {
    // TODO: Implement Firestore document update.
    console.log("updateCompanyProfile called with:", profile);
    return Promise.reject("Function not implemented.");
}

// --- CUSTOMER FUNCTIONS ---

export async function getCustomers(): Promise<Customer[]> {
    // TODO: Implement Firestore collection fetch.
    console.log("getCustomers called");
    return [];
};

export async function addCustomer(customerData: Omit<Customer, 'id' | 'status' | 'avatar' | 'activity'>): Promise<Customer> {
    // TODO: Implement Firestore document creation.
    console.log("addCustomer called with:", customerData);
    return Promise.reject("Function not implemented.");
};

export async function getCustomerById(id: string): Promise<Customer | undefined> {
    // TODO: Implement Firestore document fetch.
    console.log("getCustomerById called with:", id);
    return Promise.reject("Function not implemented.");
}

export async function updateCustomer(id: string, updatedData: Partial<Omit<Customer, 'id' | 'avatar'>>): Promise<Customer | null> {
    // TODO: Implement Firestore document update.
    console.log("updateCustomer called with:", id, updatedData);
    return Promise.reject("Function not implemented.");
};

export async function deleteCustomer(id: string): Promise<void> {
    // TODO: Implement Firestore document deletion.
    console.log("deleteCustomer called with:", id);
    return Promise.reject("Function not implemented.");
};

// --- DEAL FUNCTIONS ---

export async function getDeals(): Promise<Deal[]> {
    // TODO: Implement Firestore collection fetch.
    console.log("getDeals called");
    return [];
};

export async function addDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
    // TODO: Implement Firestore document creation.
    console.log("addDeal called with:", deal);
    return Promise.reject("Function not implemented.");
};

export async function getDealById(id: string): Promise<Deal | undefined> {
    // TODO: Implement Firestore document fetch.
    console.log("getDealById called with:", id);
    return Promise.reject("Function not implemented.");
}

export async function updateDeal(id: string, updatedData: Partial<Omit<Deal, 'id'>>): Promise<Deal | null> {
    // TODO: Implement Firestore document update.
    console.log("updateDeal called with:", id, updatedData);
    return Promise.reject("Function not implemented.");
};

export async function deleteDeal(id: string): Promise<void> {
    // TODO: Implement Firestore document deletion.
    console.log("deleteDeal called with:", id);
    return Promise.reject("Function not implemented.");
};

// --- ACTIVITY FUNCTIONS ---

export async function addActivity(customerId: string, activity: Omit<Activity, 'id' | 'date'>): Promise<Customer | null> {
    // TODO: Implement Firestore sub-collection document creation.
    console.log("addActivity called with:", customerId, activity);
    return Promise.reject("Function not implemented.");
}

// --- LEAD FUNCTIONS ---

export async function getLeads(): Promise<Lead[]> {
    // TODO: Implement Firestore collection fetch.
    console.log("getLeads called");
    return [];
}

export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
    // TODO: Implement Firestore document creation.
    console.log("addLead called with:", leadData);
    return Promise.reject("Function not implemented.");
}
