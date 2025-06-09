/**
 * Mock database service for development when MongoDB is not available
 */

const mockData = require('./mock-data');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

// Deep clone the mock data to avoid modifying the original
const db = {
  users: JSON.parse(JSON.stringify(mockData.users)),
  subscriptionPlans: JSON.parse(JSON.stringify(mockData.subscriptionPlans)),
  subscriptions: JSON.parse(JSON.stringify(mockData.subscriptions)),
  worksheets: JSON.parse(JSON.stringify(mockData.worksheets)),
  settings: JSON.parse(JSON.stringify(mockData.settings))
};

// Helper functions to mimic Mongoose functionality
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Mock User model
const User = {
  find: async () => db.users,
  findOne: async (query) => {
    if (query.email) {
      return db.users.find(user => user.email === query.email);
    }
    return null;
  },
  findById: async (id) => {
    const user = db.users.find(user => user._id === id);
    if (user) {
      // Populate activeSubscription if it exists
      if (user.activeSubscription) {
        const subscription = db.subscriptions.find(sub => sub._id === user.activeSubscription);
        if (subscription) {
          user.activeSubscription = subscription;
        }
      }
    }
    return user;
  },
  create: async (userData) => {
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(newUser);
    return newUser;
  }
};

// Add methods to User model
User.prototype = {
  matchPassword: async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },
  generateAuthToken: function() {
    return jwt.sign(
      { 
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
};

// Mock SubscriptionPlan model
const SubscriptionPlan = {
  find: async () => db.subscriptionPlans,
  findOne: async (query) => {
    if (query.name) {
      return db.subscriptionPlans.find(plan => plan.name === query.name);
    }
    return null;
  },
  findById: async (id) => {
    return db.subscriptionPlans.find(plan => plan._id === id);
  },
  create: async (planData) => {
    const newPlan = {
      _id: generateId(),
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.subscriptionPlans.push(newPlan);
    return newPlan;
  }
};

// Add save method to all mock documents
const addSaveMethods = (obj) => {
  if (obj) {
    obj.save = async function() {
      this.updatedAt = new Date();
      return this;
    };
  }
  return obj;
};

// Wrap all find methods to add save methods to returned documents
const originalUserFindById = User.findById;
User.findById = async (id) => {
  const result = await originalUserFindById(id);
  return addSaveMethods(result);
};

const originalPlanFindById = SubscriptionPlan.findById;
SubscriptionPlan.findById = async (id) => {
  const result = await originalPlanFindById(id);
  return addSaveMethods(result);
};

// Mock Settings model
const Settings = {
  findOne: async (query) => {
    if (query.type === 'site') {
      return addSaveMethods(db.settings.site);
    } else if (query.type === 'subscription') {
      return addSaveMethods(db.settings.subscription);
    }
    return null;
  },
  create: async (settingsData) => {
    const newSettings = {
      _id: generateId(),
      ...settingsData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    if (settingsData.type === 'site') {
      db.settings.site = newSettings;
    } else if (settingsData.type === 'subscription') {
      db.settings.subscription = newSettings;
    }
    return addSaveMethods(newSettings);
  }
};

// Mock Worksheet model
const Worksheet = {
  find: async () => db.worksheets.map(worksheet => addSaveMethods(worksheet)),
  findById: async (id) => {
    const worksheet = db.worksheets.find(worksheet => worksheet._id === id);
    return addSaveMethods(worksheet);
  },
  create: async (worksheetData) => {
    const newWorksheet = {
      _id: generateId(),
      ...worksheetData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.worksheets.push(newWorksheet);
    return addSaveMethods(newWorksheet);
  }
};

// Mock Subscription model
const Subscription = {
  find: async () => db.subscriptions.map(subscription => addSaveMethods(subscription)),
  findById: async (id) => {
    const subscription = db.subscriptions.find(subscription => subscription._id === id);
    return addSaveMethods(subscription);
  },
  create: async (subscriptionData) => {
    const newSubscription = {
      _id: generateId(),
      ...subscriptionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.subscriptions.push(newSubscription);
    return addSaveMethods(newSubscription);
  }
};

module.exports = {
  User,
  SubscriptionPlan,
  Settings,
  Worksheet,
  Subscription
};
