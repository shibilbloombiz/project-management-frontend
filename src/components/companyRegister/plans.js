export const REGISTRATION_PLANS = [
  {
    name: 'Free',
    price: 0,
    limit: '5 Users',
    maxUsers: 5,
    maxProjects: 3,
    features: ['Limited capacity scope', 'In-memory fallback store resilience', 'Shared client portals'],
  },
  {
    name: 'Starter Package',
    price: 2500,
    limit: '15 Users',
    maxUsers: 15,
    maxProjects: 10,
    features: ['Starter PM modules', 'Daily persistent checkpoints', 'SaaS client gateways'],
  },
  {
    name: 'Scale Package Tier',
    price: 8900,
    limit: '50 Users',
    maxUsers: 50,
    maxProjects: 30,
    features: ['Automated shift attendance logs', 'Excel/CSV download reports', 'Soft-delete trash bin'],
  },
];
