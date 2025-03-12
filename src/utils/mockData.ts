
export interface ViolationType {
  id: string;
  address: string;
  violationType: string;
  dateIssued: string;
  status: 'Open' | 'Closed' | 'In Progress';
  description: string;
  fineAmount: number | null;
  dueDate: string | null;
  propertyOwner: string;
}

export const mockViolations: ViolationType[] = [
  {
    id: "v1",
    address: "123 Forbes Ave, Pittsburgh, PA 15213",
    violationType: "Building Code",
    dateIssued: "2025-01-15",
    status: "Open",
    description: "Exterior wall deterioration requiring repair",
    fineAmount: 350,
    dueDate: "2025-03-15",
    propertyOwner: "Oakland Properties LLC"
  },
  {
    id: "v2",
    address: "456 Murray Ave, Pittsburgh, PA 15217",
    violationType: "Sanitation",
    dateIssued: "2025-01-23",
    status: "Closed",
    description: "Improper garbage disposal",
    fineAmount: 150,
    dueDate: null,
    propertyOwner: "Squirrel Hill Holdings"
  },
  {
    id: "v3",
    address: "789 Butler St, Pittsburgh, PA 15201",
    violationType: "Zoning",
    dateIssued: "2025-02-05",
    status: "In Progress",
    description: "Unauthorized business operation in residential zone",
    fineAmount: 500,
    dueDate: "2025-04-05",
    propertyOwner: "Lawrenceville Development"
  },
  {
    id: "v4",
    address: "123 Forbes Ave, Pittsburgh, PA 15213",
    violationType: "Fire Safety",
    dateIssued: "2025-02-10",
    status: "Open",
    description: "Missing smoke detectors on premises",
    fineAmount: 250,
    dueDate: "2025-04-10",
    propertyOwner: "Oakland Properties LLC"
  },
  {
    id: "v5",
    address: "101 Wood St, Pittsburgh, PA 15222",
    violationType: "Property Maintenance",
    dateIssued: "2025-02-12",
    status: "Open",
    description: "Overgrown vegetation exceeding 10 inches",
    fineAmount: 100,
    dueDate: "2025-03-12",
    propertyOwner: "Downtown Realty Group"
  }
];

export const getViolationsByAddress = (address: string): ViolationType[] => {
  if (!address) return [];
  
  // Simulate API call with delay
  return mockViolations.filter(violation => 
    violation.address.toLowerCase().includes(address.toLowerCase())
  );
};
