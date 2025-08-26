

import { addDays } from 'date-fns';

export type Role = 'Admin' | 'Sales Rep';

export type User = {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be hashed in a real app
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

const today = new Date();

export const initialUsers: User[] = [
    { id: 'U001', name: 'Admin User', email: 'admin@n-crm.com', password: 'password', role: 'Admin', avatar: 'https://placehold.co/40x40.png', organizationId: 'O001' },
    { id: 'U002', name: 'Sales Rep Sally', email: 'sally@n-crm.com', password: 'password', role: 'Sales Rep', avatar: 'https://placehold.co/40x40.png', organizationId: 'O001' },
];

export const initialCompanyProfiles: CompanyProfile[] = [
    { id: 'O001', name: 'N-CRM Inc.', logo: '' },
];


export const initialCustomersData: Customer[] = [];
let dealsData: Deal[] = [];
export const leadsSourceData = [];
export const recentSales = [];

export const teamPerformance = [
    { name: 'Alice', deals: 12, value: 150000 },
    { name: 'Bob', deals: 8, value: 95000 },
    { name: 'Charlie', deals: 15, value: 210000 },
    { name: 'Diana', deals: 10, value: 130000 },
    { name: 'Eve', deals: 5, value: 60000 },
];

const initializeData = <T>(key: string, initialData: T[]): T[] => {
    if (typeof window === 'undefined') {
        return initialData;
    }
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            const parsedData = JSON.parse(storedData, (key, value) => {
                // Add 'createdAt' date parsing
                if ((key === 'closeDate' || key === 'date' || key === 'createdAt') && typeof value === 'string') {
                    return new Date(value);
                }
                return value;
            });
            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        }
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    } catch (error) {
        console.error(`Error with local storage for key "${key}":`, error);
        return initialData;
    }
}

// Initialize data sources
let users = initializeData('users', initialUsers);
let companyProfiles = initializeData('companyProfiles', initialCompanyProfiles);
let customersData = initializeData('customers', initialCustomersData);
let dealsDataStore = initializeData('deals', dealsData);
let leadsDataStore = initializeData('leads', [] as Lead[]); // Initialize leads store

export const registerUser = (data: {name: string, email: string, password: string, organizationName: string }) => {
    users = initializeData('users', initialUsers);
    companyProfiles = initializeData('companyProfiles', initialCompanyProfiles);

    if (users.find(u => u.email === data.email)) {
        throw new Error('An account with this email already exists.');
    }

    const newOrgId = `O${Date.now()}`;
    const newCompanyProfile: CompanyProfile = {
        id: newOrgId,
        name: data.organizationName,
        logo: '',
    };
    companyProfiles.push(newCompanyProfile);
    localStorage.setItem('companyProfiles', JSON.stringify(companyProfiles));
    
    const newUser: User = {
        id: `U${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password, // In a real app, hash this!
        role: 'Admin', // First user is always an admin
        avatar: `https://placehold.co/40x40.png?text=${data.name.charAt(0)}`,
        organizationId: newOrgId,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
    users = initializeData('users', initialUsers);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    return null;
};

const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    return JSON.parse(userJson);
}

export const getCompanyProfile = (): CompanyProfile | null => {
    const user = getCurrentUser();
    if (!user) return null;
    companyProfiles = initializeData('companyProfiles', initialCompanyProfiles);
    return companyProfiles.find(p => p.id === user.organizationId) || null;
}

export const updateCompanyProfile = (profile: CompanyProfile) => {
    companyProfiles = initializeData('companyProfiles', initialCompanyProfiles);
    const index = companyProfiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
        companyProfiles[index] = profile;
        localStorage.setItem('companyProfiles', JSON.stringify(companyProfiles));
    }
}

// Customer Functions
export const getCustomers = (): Customer[] => {
    customersData = initializeData('customers', initialCustomersData);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const orgCustomers = customersData.filter(c => c.organizationId === currentUser.organizationId);

    if (currentUser.role === 'Admin') {
        return orgCustomers;
    }
    return orgCustomers.filter(c => c.ownerId === currentUser.id);
};

export const addCustomer = (customerData: { name: string; email: string; organization: string; phone?: string; ownerId: string; organizationId: string; }) => {
    customersData = initializeData('customers', []);
    const newCustomer: Customer = {
        id: `C${Date.now()}`,
        name: customerData.name,
        email: customerData.email,
        organization: customerData.organization,
        phone: customerData.phone || undefined,
        status: 'Active',
        avatar: `https://placehold.co/40x40.png?text=${customerData.name.charAt(0)}`,
        activity: [],
        ownerId: customerData.ownerId,
        organizationId: customerData.organizationId,
    };
    customersData.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customersData));
    return newCustomer;
};

export const getCustomerById = (id: string): Customer | undefined => {
    return initializeData('customers', []).find(customer => customer.id === id);
}

export const updateCustomer = (id: string, updatedData: Partial<Omit<Customer, 'id' | 'avatar'>>) => {
    const customers = initializeData('customers', []);
    const customerIndex = customers.findIndex(customer => customer.id === id);
    if (customerIndex > -1) {
        customers[customerIndex] = { ...customers[customerIndex], ...updatedData };
        localStorage.setItem('customers', JSON.stringify(customers));
        return customers[customerIndex];
    }
    return null;
};

export const deleteCustomer = (id: string) => {
    let customers = initializeData('customers', []);
    customers = customers.filter(customer => customer.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
};

// Deal Functions
export const getDeals = (): Deal[] => {
    dealsDataStore = initializeData('deals', []);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const orgDeals = dealsDataStore.filter(d => d.organizationId === currentUser.organizationId);

    if (currentUser.role === 'Admin') {
        return orgDeals;
    }
    return orgDeals.filter(d => d.ownerId === currentUser.id);
};

export const addDeal = (deal: Omit<Deal, 'id' | 'ownerId' | 'organizationId'>) => {
    dealsDataStore = initializeData('deals', []);
    const currentUser = getCurrentUser();
     if (!currentUser) throw new Error("No logged in user");
    const newDeal: Deal = {
        ...deal,
        id: `D${Date.now()}`,
        ownerId: currentUser.id,
        organizationId: currentUser.organizationId,
    };
    dealsDataStore.push(newDeal);
    localStorage.setItem('deals', JSON.stringify(dealsDataStore));
    return newDeal;
};

export const getDealById = (id: string): Deal | undefined => {
    return initializeData('deals', []).find(deal => deal.id === id);
}

export const updateDeal = (id: string, updatedData: Partial<Omit<Deal, 'id'>>) => {
    const deals = initializeData('deals', []);
    const dealIndex = deals.findIndex(deal => deal.id === id);
    if (dealIndex > -1) {
        deals[dealIndex] = { ...deals[dealIndex], ...updatedData };
        localStorage.setItem('deals', JSON.stringify(deals));
        return deals[dealIndex];
    }
    return null;
};

export const deleteDeal = (id: string) => {
    let deals = initializeData('deals', []);
    deals = deals.filter(deal => deal.id !== id);
    localStorage.setItem('deals', JSON.stringify(deals));
};

// Activity Functions
export const addActivity = (customerId: string, activity: Omit<Activity, 'id' | 'date'>) => {
    const customers = initializeData('customers', []);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex > -1) {
        const newActivity: Activity = {
            ...activity,
            id: `A${Date.now()}`,
            date: new Date(),
        };
        if (!customers[customerIndex].activity) {
            customers[customerIndex].activity = [];
        }
        customers[customerIndex].activity.push(newActivity);
        localStorage.setItem('customers', JSON.stringify(customers));
        return customers[customerIndex];
    }
    return null;
}

// Lead Functions
export const getLeads = (): Lead[] => {
    leadsDataStore = initializeData('leads', []);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const orgLeads = leadsDataStore.filter(l => l.organizationId === currentUser.organizationId);

    if (currentUser.role === 'Admin') {
        return orgLeads;
    }
    return orgLeads.filter(l => l.ownerId === currentUser.id);
}

export const addLead = (leadData: { name: string; email: string; organization: string; phone?: string; ownerId: string, organizationId: string }) => {
    leadsDataStore = initializeData('leads', []);

    const newLead: Lead = {
        id: `L${Date.now()}`,
        name: leadData.name,
        email: leadData.email,
        organization: leadData.organization,
        phone: leadData.phone || undefined,
        createdAt: new Date(),
        status: 'New',
        ownerId: leadData.ownerId,
        organizationId: leadData.organizationId,
    };
    leadsDataStore.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leadsDataStore));
    return newLead;
}
