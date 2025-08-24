
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

export const dealsData = [
    { id: 'D001', name: 'ERP System for AgriMart', stage: 'Proposal', value: 7500000, company: 'AgriMart' },
    { id: 'D002', name: 'Mobile App for FinServe', stage: 'Negotiation', value: 12000000, company: 'FinServe Solutions' },
    { id: 'D003', name: 'Cloud Migration for TechCo', stage: 'Closed Won', value: 25000000, company: 'TechCo Nigeria' },
    { id: 'D004', name: 'Logistics Platform Upgrade', stage: 'Qualification', value: 5000000, company: 'Speedy Logistics' },
    { id: 'D005', name: 'Telemedicine Portal', stage: 'Proposal', value: 9500000, company: 'HealthWise Ltd' },
    { id: 'D006', name: 'E-learning Platform', stage: 'Closed Lost', value: 6000000, company: 'EduTech Innovations' },
    { id: 'D007', name: 'Solar Power Installation', stage: 'Negotiation', value: 18000000, company: 'PowerGen NG' },
    { id: 'D008', name: 'New Retail Branch Fit-out', stage: 'Closed Won', value: 3000000, company: 'RetailHub' },
    { id: 'D009', name: 'Website Redesign', stage: 'Qualification', value: 2000000, company: 'Fashionista NG' },
    { id: 'D010', name: 'Construction Material Supply', stage: 'Proposal', value: 4500000, company: 'BuildIt Construction' },
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

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
    status: 'Active' | 'Inactive';
    avatar: string;
}

export const initialCustomersData: Customer[] = [
    { id: 'C001', name: 'Adekunle Ciroma', email: 'kunle@techco.ng', phone: '+2348012345678', company: 'TechCo Nigeria', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C002', name: 'Ngozi Okoro', email: 'ngozi@finserve.com', phone: '+2348023456789', company: 'FinServe Solutions', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C003', name: 'Chinedu Eze', email: 'chinedu@agrimart.ng', phone: '+2348034567890', company: 'AgriMart', status: 'Inactive', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C004', name: 'Fatima Bello', email: 'fatima@healthwise.com.ng', phone: '+2348045678901', company: 'HealthWise Ltd', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C005', name: 'Yusuf Alabi', email: 'yusuf@logistics.ng', phone: '+2348056789012', company: 'Speedy Logistics', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C006', name: 'Aisha Lawal', email: 'aisha@edutech.ng', phone: '+2348067890123', company: 'EduTech Innovations', status: 'Inactive', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C007', name: 'Emeka Nwosu', email: 'emeka@powergen.com', phone: '+2348078901234', company: 'PowerGen NG', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C008', name: 'Hadiza Musa', email: 'hadiza@buildit.ng', phone: '+2348089012345', company: 'BuildIt Construction', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C009', name: 'Tunde Adebayo', email: 'tunde@retailhub.ng', phone: '+2348090123456', company: 'RetailHub', status: 'Inactive', avatar: 'https://placehold.co/40x40.png' },
    { id: 'C010', name: 'Sekinat Balogun', email: 'sekinat@fashionista.com', phone: '+2348101234567', company: 'Fashionista NG', status: 'Active', avatar: 'https://placehold.co/40x40.png' },
];

// Helper to get customers from local storage
export const getCustomers = (): Customer[] => {
    if (typeof window === 'undefined') {
        return initialCustomersData;
    }
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
        return JSON.parse(storedCustomers);
    }
    localStorage.setItem('customers', JSON.stringify(initialCustomersData));
    return initialCustomersData;
};

// Helper to add a customer to local storage
export const addCustomer = (customer: Omit<Customer, 'id' | 'status' | 'avatar'>) => {
    const customers = getCustomers();
    const newCustomer: Customer = {
        ...customer,
        id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
        status: 'Active',
        avatar: `https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`,
    };
    const updatedCustomers = [...customers, newCustomer];
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    return newCustomer;
};
