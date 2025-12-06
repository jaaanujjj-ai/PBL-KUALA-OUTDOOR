// import axios from 'axios'

// const API_BASE_URL = 'http://localhost/PBL%20-%20KELANA%20OUTDOOR/api'

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// // Equipment API functions
// export const equipmentAPI = {
//   // Get all equipment
//   getAll: () => api.get('/equipment.php?action=list'),
  
//   // Get equipment by ID
//   getById: (id: number) => api.get(`/equipment.php?action=detail&id=${id}`),
  
//   // Get equipment by category
//   getByCategory: (category: string) => api.get(`/equipment.php?action=by_category&category=${category}`),
  
//   // Get all categories
//   getCategories: () => api.get('/equipment.php?action=categories'),
  
//   // Search equipment (we'll add this later)
//   search: (keyword: string) => api.get(`/equipment.php?action=search&q=${keyword}`)
// }

// // Types for equipment data
// export interface Equipment {
//   equipment_id: number
//   name: string
//   code: string
//   description: string
//   category: string
//   size_capacity: string
//   dimensions?: string
//   weight?: number
//   material?: string
//   stock_quantity: number
//   price_per_day: number
//   condition: string
//   image_url?: string
//   created_at: string
// }

// export interface ApiResponse<T> {
//   status: string
//   count?: number
//   data: T
//   message?: string
// }

import axios from 'axios'

const API_BASE_URL = 'http://localhost/PBL-KELANA-OUTDOOR/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Equipment API functions
export const equipmentAPI = {
  // Get all equipment
  getAll: () => api.get('/equipment.php?action=list'),
  
  // Get equipment by ID
  getById: (id: number) => api.get(`/equipment.php?action=detail&id=${id}`),
  
  // Get equipment by category
  getByCategory: (category: string) => api.get(`/equipment.php?action=by_category&category=${category}`),
  
  // Get all categories
  getCategories: () => api.get('/equipment.php?action=categories'),
  
  // Search equipment
  search: (keyword: string) => api.get(`/equipment.php?action=search&q=${keyword}`)
}

// Customer/Auth API functions
export const authAPI = {
  // Login customer
  login: (email: string, password: string) => 
    api.post('/auth.php?action=login', { email, password }),
  
  // Register customer
  register: (data: RegisterData) => 
    api.post('/auth.php?action=register', data),
  
  // Get customer profile
  getProfile: (customerId: number) => 
    api.get(`/customers.php?action=profile&id=${customerId}`)
}

// Booking API functions (untuk nanti)
export const bookingAPI = {
  // Create booking
  create: (bookingData: BookingData) => 
    api.post('/bookings.php?action=create', bookingData),
  
  // Get customer bookings
  getByCustomer: (customerId: number) => 
    api.get(`/bookings.php?action=by_customer&customer_id=${customerId}`)
}

// Type definitions sesuai dengan database structure
export interface Equipment {
  equipment_id: number
  name: string
  code: string
  description: string
  category: string
  size_capacity: string
  dimensions?: string
  weight?: number
  material?: string
  stock_quantity: number
  price_per_day: number
  condition: string
  equipment_type: string
  image_url?: string
  created_at: string
}

export interface Customer {
  customer_id: number
  name: string
  phone: string
  email: string
  identity_card_number?: string
  emergency_contact?: string
  created_at: string
}

export interface RegisterData {
  name: string
  phone: string
  email: string
  password: string
  identity_card_number?: string
  emergency_contact?: string
}

export interface BookingData {
  customer_id: number
  start_date: string
  end_date: string
  items: BookingItem[]
}

export interface BookingItem {
  equipment_id?: number
  package_id?: number
  quantity: number
  item_type: 'single' | 'package'
}

export interface ApiResponse<T> {
  status: string
  count?: number
  data: T
  message?: string
}