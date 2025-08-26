

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
export const dealsData: Deal[] = [];
export const leadsSourceData: { name: string; count: number; fill: string }[] = [
    { name: 'Social Media', count: 25, fill: 'var(--color-chart-1)' },
    { name: 'Website', count: 35, fill: 'var(--color-chart-2)' },
    { name: 'Referral', count: 15, fill: 'var(--color-chart-3)' },
    { name: 'Advertisement', count: 20, fill: 'var(--color-chart-4)' },
    { name: 'Email', count: 5, fill: 'var(--color-chart-5)' },
];
export const recentSales: any[] = [];

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
    const allUsers = initializeData('users', initialUsers);
    const user = allUsers.find(u => u.email === email && u.password === password);
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
    const allProfiles = initializeData('companyProfiles', initialCompanyProfiles);
    return allProfiles.find(p => p.id === user.organizationId) || null;
}

export const updateCompanyProfile = (profile: CompanyProfile) => {
    const allProfiles = initializeData('companyProfiles', initialCompanyProfiles);
    const index = allProfiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
        allProfiles[index] = profile;
        localStorage.setItem('companyProfiles', JSON.stringify(allProfiles));
    }
}

// Customer Functions
export const getCustomers = (): Customer[] => {
    const allCustomers = initializeData('customers', []);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const orgCustomers = allCustomers.filter(c => c.organizationId === currentUser.organizationId);

    if (currentUser.role === 'Admin') {
        return orgCustomers;
    }
    return orgCustomers.filter(c => c.ownerId === currentUser.id);
};

export const addCustomer = (customerData: { name: string; email: string; organization: string; phone?: string; ownerId: string; organizationId: string; }) => {
    const allCustomers = initializeData('customers', []);
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
    allCustomers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(allCustomers));
    return newCustomer;
};

export const getCustomerById = (id: string): Customer | undefined => {
    const allCustomers = initializeData('customers', []);
    return allCustomers.find(customer => customer.id === id);
}

export const updateCustomer = (id: string, updatedData: Partial<Omit<Customer, 'id' | 'avatar'>>) => {
    const allCustomers = initializeData('customers', []);
    const customerIndex = allCustomers.findIndex(customer => customer.id === id);
    if (customerIndex > -1) {
        allCustomers[customerIndex] = { ...allCustomers[customerIndex], ...updatedData };
        localStorage.setItem('customers', JSON.stringify(allCustomers));
        return allCustomers[customerIndex];
    }
    return null;
};

export const deleteCustomer = (id: string) => {
    let allCustomers = initializeData('customers', []);
    allCustomers = allCustomers.filter(customer => customer.id !== id);
    localStorage.setItem('customers', JSON.stringify(allCustomers));
};

// Deal Functions
export const getDeals = (): Deal[] => {
    const allDeals = initializeData('deals', []);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const orgDeals = allDeals.filter(d => d.organizationId === currentUser.organizationId);

    if (currentUser.role === 'Admin') {
        return orgDeals;
    }
    return orgDeals.filter(d => d.ownerId === currentUser.id);
};

export const addDeal = (deal: Omit<Deal, 'id' | 'ownerId' | 'organizationId'>) => {
    const allDeals = initializeData('deals', []);
    const currentUser = getCurrentUser();
     if (!currentUser) throw new Error("No logged in user");
    const newDeal: Deal = {
        ...deal,
        id: `D${Date.now()}`,
        ownerId: currentUser.id,
        organizationId: currentUser.organizationId,
    };
    allDeals.push(newDeal);
    localStorage.setItem('deals', JSON.stringify(allDeals));
    return newDeal;
};

export const getDealById = (id: string): Deal | undefined => {
    const allDeals = initializeData('deals', []);
    return allDeals.find(deal => deal.id === id);
}

export const updateDeal = (id: string, updatedData: Partial<Omit<Deal, 'id'>>) => {
    const allDeals = initializeData('deals', []);
    const dealIndex = allDeals.findIndex(deal => deal.id === id);
    if (dealIndex > -1) {
        allDeals[dealIndex] = { ...allDeals[dealIndex], ...updatedData };
        localStorage.setItem('deals', JSON.stringify(allDeals));
        return allDeals[dealIndex];
    }
    return null;
};

export const deleteDeal = (id: string) => {
    let allDeals = initializeData('deals', []);
    allDeals = allDeals.filter(deal => deal.id !== id);
    localStorage.setItem('deals', JSON.stringify(allDeals));
};

// Activity Functions
export const addActivity = (customerId: string, activity: Omit<Activity, 'id' | 'date'>) => {
    const allCustomers = initializeData('customers', []);
    const customerIndex = allCustomers.findIndex(c => c.id === customerId);
    if (customerIndex > -1) {
        const newActivity: Activity = {
            ...activity,
            id: `A${Date.now()}`,
            date: new Date(),
        };
        if (!allCustomers[customerIndex].activity) {
            allCustomers[customerIndex].activity = [];
        }
        allCustomers[customerIndex].activity.push(newActivity);
        localStorage.setItem('customers', JSON.stringify(allCustomers));
        return allCustomers[customerIndex];
    }
    return null;
}

// Lead Functions
export const getLeads = (): Lead[] => {
    const allLeads = initializeData('leads', []);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const orgLeads = allLeads.filter(l => l.organizationId === currentUser.organizationId);

    if (currentUser.role === 'Admin') {
        return orgLeads;
    }
    return orgLeads.filter(l => l.ownerId === currentUser.id);
}

export const addLead = (leadData: { name: string; email: string; organization: string; phone?: string; ownerId: string, organizationId: string }) => {
    const allLeads = initializeData('leads', []);

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
    allLeads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(allLeads));
    return newLead;
}
