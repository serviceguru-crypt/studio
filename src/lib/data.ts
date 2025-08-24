
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

export type Deal = {
    id: string;
    name: string;
    stage: 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    value: number;
    customerId: string;
    ownerId: string;
    closeDate: Date;
    leadScore?: 'Hot' | 'Warm' | 'Cold';
    justification?: string;
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
}

const today = new Date();

export const initialUsers: User[] = [
    { id: 'U001', name: 'Admin User', email: 'admin@n-crm.com', password: 'password', role: 'Admin', avatar: 'https://placehold.co/40x40.png', organizationId: 'O001' },
    { id: 'U002', name: 'Sales Rep Sally', email: 'sally@n-crm.com', password: 'password', role: 'Sales Rep', avatar: 'https://placehold.co/40x40.png', organizationId: 'O001' },
];

export const initialCompanyProfiles: CompanyProfile[] = [
    { id: 'O001', name: 'N-CRM Inc.', logo: '' },
];


export const initialCustomersData: Customer[] = [
    { id: 'C001', name: 'Adekunle Ciroma', email: 'kunle@techco.ng', phone: '+2348012345678', organization: 'TechCo Nigeria', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U001' },
    { id: 'C002', name: 'Ngozi Okoro', email: 'ngozi@finserve.com', phone: '+2348023456789', organization: 'FinServe Solutions', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U002' },
    { id: 'C003', name: 'Chinedu Eze', email: 'chinedu@agrimart.ng', phone: '+2348034567890', organization: 'AgriMart', status: 'Inactive', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U001' },
    { id: 'C004', name: 'Fatima Bello', email: 'fatima@healthwise.com.ng', phone: '+2348045678901', organization: 'HealthWise Ltd', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U002' },
    { id: 'C005', name: 'Yusuf Alabi', email: 'yusuf@logistics.ng', phone: '+2348056789012', organization: 'Speedy Logistics', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U001' },
    { id: 'C006', name: 'Aisha Lawal', email: 'aisha@edutech.ng', phone: '+2348067890123', organization: 'EduTech Innovations', status: 'Inactive', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U002' },
    { id: 'C007', name: 'Emeka Nwosu', email: 'emeka@powergen.com', phone: '+2348078901234', organization: 'PowerGen NG', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U001' },
    { id: 'C008', name: 'Hadiza Musa', email: 'hadiza@buildit.ng', phone: '+2348089012345', organization: 'BuildIt Construction', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U002' },
    { id: 'C009', name: 'Tunde Adebayo', email: 'tunde@retailhub.ng', phone: '+2348090123456', organization: 'RetailHub', status: 'Inactive', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U001' },
    { id: 'C010', name: 'Sekinat Balogun', email: 'sekinat@fashionista.com', phone: '+2348101234567', organization: 'Fashionista NG', status: 'Active', avatar: 'https://placehold.co/40x40.png', activity: [], ownerId: 'U002' },
];

let dealsData: Deal[] = [
    { id: 'D001', name: 'ERP System for AgriMart', stage: 'Proposal', value: 7500000, customerId: 'C003', ownerId: 'U001', closeDate: addDays(today, 10) },
    { id: 'D002', name: 'Mobile App for FinServe', stage: 'Negotiation', value: 12000000, customerId: 'C002', ownerId: 'U002', closeDate: addDays(today, 25) },
    { id: 'D003', name: 'Cloud Migration for TechCo', stage: 'Closed Won', value: 25000000, customerId: 'C001', ownerId: 'U001', closeDate: addDays(today, -5) },
    { id: 'D004', name: 'Logistics Platform Upgrade', stage: 'Qualification', value: 5000000, customerId: 'C005', ownerId: 'U001', closeDate: addDays(today, 45) },
    { id: 'D005', name: 'Telemedicine Portal', stage: 'Proposal', value: 9500000, customerId: 'C004', ownerId: 'U002', closeDate: addDays(today, 15) },
    { id: 'D006', name: 'E-learning Platform', stage: 'Closed Lost', value: 6000000, customerId: 'C006', ownerId: 'U002', closeDate: addDays(today, -2) },
    { id: 'D007', name: 'Solar Power Installation', stage: 'Negotiation', value: 18000000, customerId: 'C007', ownerId: 'U001', closeDate: addDays(today, 30) },
    { id: 'D008', name: 'New Retail Branch Fit-out', stage: 'Closed Won', value: 3000000, customerId: 'C009', ownerId: 'U001', closeDate: addDays(today, -1) },
    { id: 'D009', name: 'Website Redesign', stage: 'Qualification', value: 2000000, customerId: 'C010', ownerId: 'U002', closeDate: addDays(today, 60) },
    { id: 'D010', name: 'Construction Material Supply', stage: 'Proposal', value: 4500000, customerId: 'C008', ownerId: 'U002', closeDate: addDays(today, 20) },
];


export const recentSales = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999.00, avatar: 'https://placehold.co/40x40.png' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39.00, avatar: 'https://placehold.co/40x40.png' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299.00, avatar: 'https://placehold.co/40x40.png' },
  { name: 'William Kim', email: 'will@email.com', amount: 99.00, avatar: 'https://placehold.co/40x40.png' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 39.00, avatar: 'https://placehold.co/40x40.png' },
];

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
                if (key === 'closeDate' && typeof value === 'string') {
                    return new Date(value);
                }
                if (key === 'date' && typeof value === 'string') {
                    return new Date(value);
                }
                return value;
            });
            if (Array.isArray(parsedData) && parsedData.length > 0) {
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

export const registerUser = (data: {name: string, email: string, password: string, organizationName: string }) => {
    users = initializeData('users', initialUsers);
    companyProfiles = initializeData('companyProfiles', initialCompanyProfiles);

    if (users.find(u => u.email === data.email)) {
        throw new Error('An account with this email already exists.');
    }

    const newOrgId = `O${companyProfiles.length + 1}`;
    const newCompanyProfile: CompanyProfile = {
        id: newOrgId,
        name: data.organizationName,
        logo: '',
    };
    companyProfiles.push(newCompanyProfile);
    localStorage.setItem('companyProfiles', JSON.stringify(companyProfiles));
    
    const newUser: User = {
        id: `U${users.length + 1}`,
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


// Helper to get customers from local storage
export const getCustomers = (): Customer[] => {
    customersData = initializeData('customers', initialCustomersData);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') {
        return customersData;
    }
    return customersData.filter(c => c.ownerId === currentUser.id);
};

// Helper to add a customer to local storage
export const addCustomer = (customer: Omit<Customer, 'id' | 'status' | 'avatar' | 'activity' | 'ownerId'>) => {
    customersData = initializeData('customers', initialCustomersData); // Ensure customersData is fresh
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("No logged in user");

    const newCustomer: Customer = {
        ...customer,
        id: `C${(customersData.length + 1).toString().padStart(3, '0')}`,
        status: 'Active',
        avatar: `https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`,
        activity: [],
        ownerId: currentUser.id,
    };
    customersData.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customersData));
    return newCustomer;
};

export const getCustomerById = (id: string): Customer | undefined => {
    return initializeData('customers', initialCustomersData).find(customer => customer.id === id);
}

export const updateCustomer = (id: string, updatedData: Partial<Omit<Customer, 'id' | 'avatar'>>) => {
    const customers = initializeData('customers', initialCustomersData);
    const customerIndex = customers.findIndex(customer => customer.id === id);
    if (customerIndex > -1) {
        customers[customerIndex] = { ...customers[customerIndex], ...updatedData };
        localStorage.setItem('customers', JSON.stringify(customers));
        return customers[customerIndex];
    }
    return null;
};

export const deleteCustomer = (id: string) => {
    let customers = initializeData('customers', initialCustomersData);
    customers = customers.filter(customer => customer.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
};

// Helper to get deals from local storage
export const getDeals = (): Deal[] => {
    dealsDataStore = initializeData('deals', dealsData);
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') {
        return dealsDataStore;
    }
    return dealsDataStore.filter(d => d.ownerId === currentUser.id);
};

// Helper to add a deal to local storage
export const addDeal = (deal: Omit<Deal, 'id' | 'ownerId'>) => {
    dealsDataStore = initializeData('deals', dealsData); // Ensure dealsDataStore is fresh
    const currentUser = getCurrentUser();
     if (!currentUser) throw new Error("No logged in user");
    const newDeal: Deal = {
        ...deal,
        id: `D${(dealsDataStore.length + 1).toString().padStart(3, '0')}`,
        ownerId: currentUser.id,
    };
    dealsDataStore.push(newDeal);
    localStorage.setItem('deals', JSON.stringify(dealsDataStore));
    return newDeal;
};

export const getDealById = (id: string): Deal | undefined => {
    return initializeData('deals', dealsData).find(deal => deal.id === id);
}

export const updateDeal = (id: string, updatedData: Partial<Omit<Deal, 'id'>>) => {
    const deals = initializeData('deals', dealsData);
    const dealIndex = deals.findIndex(deal => deal.id === id);
    if (dealIndex > -1) {
        deals[dealIndex] = { ...deals[dealIndex], ...updatedData };
        localStorage.setItem('deals', JSON.stringify(deals));
        return deals[dealIndex];
    }
    return null;
};

export const deleteDeal = (id: string) => {
    let deals = initializeData('deals', dealsData);
    deals = deals.filter(deal => deal.id !== id);
    localStorage.setItem('deals', JSON.stringify(deals));
};

export const addActivity = (customerId: string, activity: Omit<Activity, 'id' | 'date'>) => {
    const customers = initializeData('customers', initialCustomersData);
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

export const leadsData = [
  { name: 'Referral', count: 150, fill: 'var(--color-chart-1)' },
  { name: 'Website', count: 120, fill: 'var(--color-chart-2)' },
  { name: 'Social Media', count: 80, fill: 'var(--color-chart-3)' },
  { name: 'Cold Call', count: 50, fill: 'var(--color-chart-4)' },
  { name: 'Events', count: 30, fill: 'var(--color-chart-5)' },
];
