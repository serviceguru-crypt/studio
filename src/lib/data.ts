
import { addDays } from 'date-fns';

export const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
  { name: 'Jul', sales: 7000 },
];

export const revenueData = [
    { month: 'Jan', revenue: 2300 },
    { month: 'Feb', revenue: 2800 },
    { month: 'Mar', revenue: 3500 },
    { month: 'Apr', revenue: 4100 },
    { month: 'May', revenue: 4800 },
    { month: 'Jun', revenue: 5200 },
];

export const leadsData = [
  { name: 'Website', count: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Referral', count: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Social Media', count: 20, fill: 'hsl(var(--chart-3))' },
  { name: 'Email', count: 10, fill: 'hsl(var(--chart-4))' },
];

export type Deal = {
    id: string;
    name: string;
    stage: 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    value: number;
    customerId: string;
    closeDate: Date;
    leadScore?: 'Hot' | 'Warm' | 'Cold';
    justification?: string;
}

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization: string;
    status: 'Active' | 'Inactive';
    avatar: string;
}

const today = new Date();

export const initialCustomersData: Customer[] = [
    { id: 'C001', name: 'Adekunle Ciroma', email: 'kunle@techco.ng', phone: '+2348012345678', organization: 'TechCo Nigeria', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C002', name: 'Ngozi Okoro', email: 'ngozi@finserve.com', phone: '+2348023456789', organization: 'FinServe Solutions', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C003', name: 'Chinedu Eze', email: 'chinedu@agrimart.ng', phone: '+2348034567890', organization: 'AgriMart', status: 'Inactive', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C004', name: 'Fatima Bello', email: 'fatima@healthwise.com.ng', phone: '+2348045678901', organization: 'HealthWise Ltd', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C005', name: 'Yusuf Alabi', email: 'yusuf@logistics.ng', phone: '+2348056789012', organization: 'Speedy Logistics', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C006', name: 'Aisha Lawal', email: 'aisha@edutech.ng', phone: '+2348067890123', organization: 'EduTech Innovations', status: 'Inactive', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C007', name: 'Emeka Nwosu', email: 'emeka@powergen.com', phone: '+2348078901234', organization: 'PowerGen NG', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C008', name: 'Hadiza Musa', email: 'hadiza@buildit.ng', phone: '+2348089012345', organization: 'BuildIt Construction', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C009', name: 'Tunde Adebayo', email: 'tunde@retailhub.ng', phone: '+2348090123456', organization: 'RetailHub', status: 'Inactive', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C010', name: 'Sekinat Balogun', email: 'sekinat@fashionista.com', phone: '+2348101234567', organization: 'Fashionista NG', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
];

let dealsData: Deal[] = [
    { id: 'D001', name: 'ERP System for AgriMart', stage: 'Proposal', value: 7500000, customerId: 'C003', closeDate: addDays(today, 10) },
    { id: 'D002', name: 'Mobile App for FinServe', stage: 'Negotiation', value: 12000000, customerId: 'C002', closeDate: addDays(today, 25) },
    { id: 'D003', name: 'Cloud Migration for TechCo', stage: 'Closed Won', value: 25000000, customerId: 'C001', closeDate: addDays(today, -5) },
    { id: 'D004', name: 'Logistics Platform Upgrade', stage: 'Qualification', value: 5000000, customerId: 'C005', closeDate: addDays(today, 45) },
    { id: 'D005', name: 'Telemedicine Portal', stage: 'Proposal', value: 9500000, customerId: 'C004', closeDate: addDays(today, 15) },
    { id: 'D006', name: 'E-learning Platform', stage: 'Closed Lost', value: 6000000, customerId: 'C006', closeDate: addDays(today, -2) },
    { id: 'D007', name: 'Solar Power Installation', stage: 'Negotiation', value: 18000000, customerId: 'C007', closeDate: addDays(today, 30) },
    { id: 'D008', name: 'New Retail Branch Fit-out', stage: 'Closed Won', value: 3000000, customerId: 'C009', closeDate: addDays(today, -1) },
    { id: 'D009', name: 'Website Redesign', stage: 'Qualification', value: 2000000, customerId: 'C010', closeDate: addDays(today, 60) },
    { id: 'D010', name: 'Construction Material Supply', stage: 'Proposal', value: 4500000, customerId: 'C008', closeDate: addDays(today, 20) },
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
let customersData = initializeData('customers', initialCustomersData);
let dealsDataStore = initializeData('deals', dealsData);


// Helper to get customers from local storage
export const getCustomers = (): Customer[] => {
    customersData = initializeData('customers', initialCustomersData);
    return customersData;
};

// Helper to add a customer to local storage
export const addCustomer = (customer: Omit<Customer, 'id' | 'status' | 'avatar'>) => {
    getCustomers(); // Ensure customersData is fresh
    const newCustomer: Customer = {
        ...customer,
        id: `C${(customersData.length + 1).toString().padStart(3, '0')}`,
        status: 'Active',
        avatar: `https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`,
    };
    customersData = [...customersData, newCustomer];
    localStorage.setItem('customers', JSON.stringify(customersData));
    return newCustomer;
};

export const getCustomerById = (id: string): Customer | undefined => {
    return getCustomers().find(customer => customer.id === id);
}

export const updateCustomer = (id: string, updatedData: Partial<Omit<Customer, 'id' | 'avatar'>>) => {
    const customers = getCustomers();
    const customerIndex = customers.findIndex(customer => customer.id === id);
    if (customerIndex > -1) {
        customers[customerIndex] = { ...customers[customerIndex], ...updatedData };
        localStorage.setItem('customers', JSON.stringify(customers));
        return customers[customerIndex];
    }
    return null;
};

export const deleteCustomer = (id: string) => {
    let customers = getCustomers();
    customers = customers.filter(customer => customer.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
};

// Helper to get deals from local storage
export const getDeals = (): Deal[] => {
    dealsDataStore = initializeData('deals', dealsData);
    return dealsDataStore;
};

// Helper to add a deal to local storage
export const addDeal = (deal: Omit<Deal, 'id'>) => {
    getDeals(); // Ensure dealsDataStore is fresh
    const newDeal: Deal = {
        ...deal,
        id: `D${(dealsDataStore.length + 1).toString().padStart(3, '0')}`,
    };
    dealsDataStore = [...dealsDataStore, newDeal];
    localStorage.setItem('deals', JSON.stringify(dealsDataStore));
    return newDeal;
};

export const getDealById = (id: string): Deal | undefined => {
    return getDeals().find(deal => deal.id === id);
}

export const updateDeal = (id: string, updatedData: Partial<Omit<Deal, 'id'>>) => {
    const deals = getDeals();
    const dealIndex = deals.findIndex(deal => deal.id === id);
    if (dealIndex > -1) {
        deals[dealIndex] = { ...deals[dealIndex], ...updatedData };
        localStorage.setItem('deals', JSON.stringify(deals));
        return deals[dealIndex];
    }
    return null;
};

export const deleteDeal = (id: string) => {
    let deals = getDeals();
    deals = deals.filter(deal => deal.id !== id);
    localStorage.setItem('deals', JSON.stringify(deals));
};
