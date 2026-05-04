export const demoCustomers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phoneNumber: "+1234567890",
    address: "123 Main Street, New York, NY 10001",
    totalOrders: 15,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@email.com",
    phoneNumber: "+1234567891",
    address: "456 Oak Avenue, Los Angeles, CA 90001",
    totalOrders: 8,
    createdAt: "2024-02-20T14:15:00Z",
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@email.com",
    phoneNumber: "+1234567892",
    address: "789 Pine Road, Chicago, IL 60601",
    totalOrders: 23,
    createdAt: "2024-01-05T09:00:00Z",
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.w@email.com",
    phoneNumber: "+1234567893",
    address: "321 Elm Street, Houston, TX 77001",
    totalOrders: 12,
    createdAt: "2024-03-10T16:45:00Z",
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@email.com",
    phoneNumber: "+1234567894",
    address: "654 Maple Drive, Phoenix, AZ 85001",
    totalOrders: 5,
    createdAt: "2024-03-25T11:20:00Z",
  },
  {
    id: 6,
    firstName: "Sarah",
    lastName: "Davis",
    email: "sarah.davis@email.com",
    phoneNumber: "+1234567895",
    address: "987 Cedar Lane, Philadelphia, PA 19101",
    totalOrders: 19,
    createdAt: "2024-02-01T13:30:00Z",
  },
  {
    id: 7,
    firstName: "Robert",
    lastName: "Miller",
    email: "robert.m@email.com",
    phoneNumber: "+1234567896",
    address: "147 Birch Court, San Antonio, TX 78201",
    totalOrders: 7,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: 8,
    firstName: "Lisa",
    lastName: "Wilson",
    email: "lisa.wilson@email.com",
    phoneNumber: "+1234567897",
    address: "258 Spruce Street, San Diego, CA 92101",
    totalOrders: 31,
    createdAt: "2023-12-20T08:15:00Z",
  },
  {
    id: 9,
    firstName: "James",
    lastName: "Moore",
    email: "james.moore@email.com",
    phoneNumber: "+1234567898",
    address: "369 Willow Way, Dallas, TX 75201",
    totalOrders: 14,
    createdAt: "2024-02-28T15:45:00Z",
  },
  {
    id: 10,
    firstName: "Jennifer",
    lastName: "Taylor",
    email: "jennifer.t@email.com",
    phoneNumber: "+1234567899",
    address: "741 Ash Boulevard, San Jose, CA 95101",
    totalOrders: 9,
    createdAt: "2024-03-05T12:00:00Z",
  },
  {
    id: 11,
    firstName: "William",
    lastName: "Anderson",
    email: "william.a@email.com",
    phoneNumber: "+1234567800",
    address: "852 Poplar Place, Austin, TX 78701",
    totalOrders: 0,
    createdAt: "2024-04-01T09:30:00Z",
  },
  {
    id: 12,
    firstName: "Mary",
    lastName: "Thomas",
    email: "mary.thomas@email.com",
    phoneNumber: "+1234567801",
    address: "963 Hickory Hill, Jacksonville, FL 32099",
    totalOrders: 26,
    createdAt: "2024-01-10T14:20:00Z",
  },
];

export const demoOrders = [
  {
    id: 1001,
    customerId: 1,
    total: 156.50,
    status: "COMPLETED",
    paymentMethod: "CARD",
    createdAt: "2024-03-28T10:30:00Z",
    items: [
      { productName: "Men Slim Fit Shirt", quantity: 2, price: 78.25 }
    ]
  },
  {
    id: 1002,
    customerId: 1,
    total: 245.00,
    status: "COMPLETED",
    paymentMethod: "CASH",
    createdAt: "2024-03-25T14:15:00Z",
    items: [
      { productName: "Casual Jeans", quantity: 1, price: 245.00 }
    ]
  },
  {
    id: 1003,
    customerId: 2,
    total: 89.99,
    status: "COMPLETED",
    paymentMethod: "UPI",
    createdAt: "2024-03-27T11:20:00Z",
    items: [
      { productName: "Cotton T-Shirt", quantity: 3, price: 29.99 }
    ]
  },
  {
    id: 1004,
    customerId: 3,
    total: 450.00,
    status: "COMPLETED",
    paymentMethod: "CARD",
    createdAt: "2024-03-26T16:45:00Z",
    items: [
      { productName: "Formal Blazer", quantity: 1, price: 450.00 }
    ]
  },
  {
    id: 1005,
    customerId: 8,
    total: 320.75,
    status: "COMPLETED",
    paymentMethod: "CASH",
    createdAt: "2024-03-29T09:00:00Z",
    items: [
      { productName: "Designer Dress", quantity: 1, price: 320.75 }
    ]
  },
  {
    id: 1006,
    customerId: 6,
    total: 125.50,
    status: "COMPLETED",
    paymentMethod: "UPI",
    createdAt: "2024-03-28T13:30:00Z",
    items: [
      { productName: "Sports Shoes", quantity: 1, price: 125.50 }
    ]
  },
  {
    id: 1007,
    customerId: 12,
    total: 199.99,
    status: "COMPLETED",
    paymentMethod: "CARD",
    createdAt: "2024-03-27T15:20:00Z",
    items: [
      { productName: "Winter Jacket", quantity: 1, price: 199.99 }
    ]
  },
];
