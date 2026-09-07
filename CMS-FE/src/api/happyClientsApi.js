// Mock API service for Happy Clients
// This simulates a backend API using localStorage

const STORAGE_KEY = 'happy_clients_data';

// Initialize with sample data if empty
const initializeSampleData = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const sampleClients = [
      {
        _id: '1',
        title: 'John Smith',
        description: 'CEO of TechCorp',
        photoUrl: null,
        company: 'TechCorp',
        position: 'CEO',
        testimonial: 'Amazing service and support!',
        rating: 5,
        isActive: true,
        featured: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Sarah Johnson',
        description: 'Marketing Director',
        photoUrl: null,
        company: 'MarketingPro',
        position: 'Marketing Director',
        testimonial: 'Exceeded all our expectations!',
        rating: 5,
        isActive: true,
        featured: false,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleClients));
  }
};

// Get all clients with pagination
export const getHappyClients = async (page = 1, limit = 20) => {
  try {
    initializeSampleData();
    const clients = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = clients.slice(startIndex, endIndex);
    
    return {
      clients: paginatedClients,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(clients.length / limit),
        totalItems: clients.length,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('Error fetching happy clients:', error);
    throw error;
  }
};

// Create a new client
export const createHappyClient = async (clientData) => {
  try {
    initializeSampleData();
    const clients = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const newClient = {
      _id: Date.now().toString(),
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    clients.push(newClient);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    
    return newClient;
  } catch (error) {
    console.error('Error creating happy client:', error);
    throw error;
  }
};

// Update a client
export const updateHappyClient = async (id, clientData) => {
  try {
    const clients = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const clientIndex = clients.findIndex(client => client._id === id);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    clients[clientIndex] = {
      ...clients[clientIndex],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    return clients[clientIndex];
  } catch (error) {
    console.error('Error updating happy client:', error);
    throw error;
  }
};

// Delete a client
export const deleteHappyClient = async (id) => {
  try {
    const clients = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filteredClients = clients.filter(client => client._id !== id);
    
    if (filteredClients.length === clients.length) {
      throw new Error('Client not found');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredClients));
    return { success: true };
  } catch (error) {
    console.error('Error deleting happy client:', error);
    throw error;
  }
};

// Upload image (simulate file upload)
export const uploadImage = async (file) => {
  try {
    // In a real app, this would upload to a server
    // For now, we'll create a fake URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result,
          filename: file.name
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
