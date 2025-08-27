
"use client";

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

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

// --- MOCK DATA ---
export const leadsSourceData: { name: string; count: number; fill: string }[] = [
    { name: 'Social Media', count: 25, fill: 'var(--color-chart-1)' },
    { name: 'Website', count: 35, fill: 'var(--color-chart-2)' },
    { name: 'Referral', count: 15, fill: 'var(--color-chart-3)' },
    { name: 'Advertisement', count: 20, fill: 'var(--color-chart-4)' },
    { name: 'Email', count: 5, fill: 'var(--color-chart-5)' },
];


let customers: Customer[] = [];
let deals: Deal[] = [];
let leads: Lead[] = [];
let users: User[] = [];
let companyProfile: CompanyProfile | null = null;
let initialized = false;

const initializeData = () => {
    if (typeof window !== 'undefined' && !initialized) {
        customers = JSON.parse(localStorage.getItem('customers') || '[]').map((c: any) => ({ ...c, activity: c.activity ? c.activity.map((a: any) => ({...a, date: new Date(a.date)})) : [] }));
        deals = JSON.parse(localStorage.getItem('deals') || '[]').map((d: any) => ({...d, closeDate: new Date(d.closeDate)}));
        leads = JSON.parse(localStorage.getItem('leads') || '[]').map((l: any) => ({...l, createdAt: new Date(l.createdAt)}));
        users = JSON.parse(localStorage.getItem('users') || '[]');
        companyProfile = JSON.parse(localStorage.getItem('companyProfile') || 'null');
        initialized = true;

        if (users.length === 0) {
             const adminUser = {
                id: 'user-1',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin',
                avatar: `https://i.pravatar.cc/150?u=user-1`,
                organizationId: 'org-1'
            };
            const salesUser = {
                id: 'user-2',
                name: 'Sales Rep',
                email: 'sales@example.com',
                password: 'password123',
                role: 'Sales Rep',
                avatar: `https://i.pravatar.cc/150?u=user-2`,
                organizationId: 'org-1'
            };
            users.push(adminUser, salesUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
};


initializeData();


// --- AUTH FUNCTIONS ---

export async function registerUser(data: {name: string, email: string, password: string, organizationName: string }): Promise<User> {
    initializeData();
    const existingUser = users.find(u => u.email === data.email);
    if(existingUser) {
        throw new Error("An account with this email already exists.");
    }
    const organizationId = `org-${Date.now()}`;
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: 'Admin',
        avatar: `https://i.pravatar.cc/150?u=${data.email}`,
        organizationId: organizationId,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    const newCompanyProfile: CompanyProfile = {
        id: organizationId,
        name: data.organizationName,
        logo: '',
    };
    companyProfile = newCompanyProfile;
    localStorage.setItem('companyProfile', JSON.stringify(newCompanyProfile));
    
    // This is a simulation, so we'll store the password in a separate, insecure way.
    // In a real app, Firebase Auth handles this securely.
    localStorage.setItem(`password_${data.email}`, data.password);

    return newUser;
};

export async function loginUser(email: string, password: string): Promise<User | null> {
    initializeData();
    const user = users.find(u => u.email === email);
    const storedPassword = localStorage.getItem(`password_${email}`);
    if (user && storedPassword === password) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    return null;
};

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// --- COMPANY PROFILE FUNCTIONS ---

export function getCompanyProfile(): CompanyProfile | null {
    initializeData();
    return companyProfile;
}

export async function updateCompanyProfile(profile: CompanyProfile): Promise<void> {
    companyProfile = profile;
    localStorage.setItem('companyProfile', JSON.stringify(profile));
    return Promise.resolve();
}

// --- CUSTOMER FUNCTIONS ---

export async function getCustomers(): Promise<Customer[]> {
    initializeData();
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    return customers.filter(c => c.organizationId === currentUser.organizationId);
};

export async function addCustomer(customerData: Omit<Customer, 'id' | 'status' | 'avatar' | 'activity'>): Promise<Customer> {
    initializeData();
    const newCustomer: Customer = {
        ...customerData,
        id: `cust-${Date.now()}`,
        status: 'Active',
        avatar: `https://i.pravatar.cc/150?u=${customerData.email}`,
        activity: []
    };
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    return newCustomer;
};

export async function getCustomerById(id: string): Promise<Customer | undefined> {
    initializeData();
    return customers.find(c => c.id === id);
}

export async function updateCustomer(id: string, updatedData: Partial<Omit<Customer, 'id'>>): Promise<Customer | null> {
    initializeData();
    let customerToUpdate = customers.find(c => c.id === id);
    if(customerToUpdate) {
        customerToUpdate = { ...customerToUpdate, ...updatedData };
        customers = customers.map(c => c.id === id ? customerToUpdate! : c);
        localStorage.setItem('customers', JSON.stringify(customers));
        return customerToUpdate;
    }
    return null;
};

export async function deleteCustomer(id: string): Promise<void> {
    customers = customers.filter(c => c.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
    return Promise.resolve();
};

// --- DEAL FUNCTIONS ---

export async function getDeals(): Promise<Deal[]> {
    initializeData();
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    const userCustomers = await getCustomers();
    const userCustomerIds = new Set(userCustomers.map(c => c.id));
    
    const userDeals = deals.filter(d => d.organizationId === currentUser.organizationId);
    
    return userDeals.map(deal => {
        const customer = userCustomers.find(c => c.id === deal.customerId);
        return {
            ...deal,
            company: customer?.organization || 'N/A'
        }
    });
};

export async function addDeal(dealData: Omit<Deal, 'id' | 'organizationId'> & { ownerId: string, organizationId: string }): Promise<Deal> {
    initializeData();
    const newDeal: Deal = {
        ...dealData,
        id: `deal-${Date.now()}`,
    };
    deals.push(newDeal);
localStorage.setItem('deals', JSON.stringify(deals));
    return newDeal;
};

export async function getDealById(id: string): Promise<Deal | undefined> {
    initializeData();
    return deals.find(d => d.id === id);
}

export async function updateDeal(id: string, updatedData: Partial<Omit<Deal, 'id'>>): Promise<Deal | null> {
    initializeData();
    let dealToUpdate = deals.find(d => d.id === id);
    if(dealToUpdate) {
        dealToUpdate = { ...dealToUpdate, ...updatedData };
        deals = deals.map(d => d.id === id ? dealToUpdate! : d);
        localStorage.setItem('deals', JSON.stringify(deals));
        return dealToUpdate;
    }
    return null;
};

export async function deleteDeal(id: string): Promise<void> {
    deals = deals.filter(d => d.id !== id);
    localStorage.setItem('deals', JSON.stringify(deals));
    return Promise.resolve();
};

// --- ACTIVITY FUNCTIONS ---

export async function addActivity(customerId: string, activityData: Omit<Activity, 'id' | 'date'>): Promise<Customer | null> {
    initializeData();
    let customer = customers.find(c => c.id === customerId);
    if (customer) {
        const newActivity: Activity = {
            ...activityData,
            id: `act-${Date.now()}`,
            date: new Date(),
        };
        customer.activity = customer.activity ? [newActivity, ...customer.activity] : [newActivity];
        customers = customers.map(c => c.id === customerId ? customer! : c);
        localStorage.setItem('customers', JSON.stringify(customers));
        return customer;
    }
    return null;
}

// --- LEAD FUNCTIONS ---

export async function getLeads(): Promise<Lead[]> {
    initializeData();
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    return leads.filter(l => l.organizationId === currentUser.organizationId);
}

export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
    initializeData();
    const newLead: Lead = {
        ...leadData,
        id: `lead-${Date.now()}`,
        createdAt: new Date(),
        status: 'New'
    };
    leads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leads));
    return newLead;
}
