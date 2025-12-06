import { apiGet, apiPost, apiDelete, apiUpload } from "./api";

// ✅ TYPE DEFINITIONS
export interface Package {
  package_id: number;
  name: string;
  capacity: string;
  capacity_text?: string;
  description: string;
  price: number;
  price_formatted: string;
  duration_days: number;
  badge?: {
    text: string;
    color: string;
  };
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  stock: {
    total: number;
    reserved: number;
    available: number;
    is_available: boolean;
  };
  images: {
    url: string | null;
    thumbnail: string | null;
  };
  items: PackageItem[];
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  item_id?: number;
  name: string;
  quantity: number;
  display_order?: number;
  notes?: string;
}

export interface CartItem {
  cart_id: number;
  package: Package;
  rental_details: {
    start_date: string;
    end_date: string;
    total_days: number;
    quantity: number;
  };
  pricing: {
    total: number;
  };
  is_available: boolean;
}

// ✅ API FUNCTIONS

// 1. GET ALL PACKAGES (untuk halaman browse)
export const getPackages = async (params?: {
  search?: string;
  sort_by?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  return apiGet(`/packages/get_packages.php?${queryParams}`);
};

// 2. GET SINGLE PACKAGE (untuk halaman detail)
export const getPackageDetail = async (packageId: number) => {
  const response = await apiGet(`/packages/get_package.php?id=${packageId}`);
  return response.data as Package;
};

// 3. CHECK AVAILABILITY (sebelum add to cart)
export const checkAvailability = async (params: {
  package_id: number;
  start_date: string;
  end_date: string;
  quantity: number;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  return apiGet(`/packages/check_availability.php?${queryParams}`);
};

// 4. ADD TO CART
export const addToCart = async (params: {
  customer_id: string;
  package_id: number;
  start_date: string;
  end_date: string;
  quantity: number;
  notes?: string;
}) => {
  return apiPost("/packages_cart/add_to_cart.php", params);
};

// 5. GET CART
export const getCart = async (customerId: string) => {
  const response = await apiGet(`/packages_cart/get_cart.php?customer_id=${customerId}`);
  return response.data;
};

// 6. REMOVE FROM CART
export const removeFromCart = async (cartId: number, customerId: string) => {
  return apiDelete("/packages_cart/remove_cart_item.php", {
    cart_id: cartId,
    customer_id: customerId,
  });
};

// 7. CREATE BOOKING (Checkout)
export const createBooking = async (params: {
  customer_id: string;
  cart_ids: number[];
  pickup_location: string;
  delivery_location?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  notes?: string;
}) => {
  return apiPost("/packages_bookings/create_booking.php", params);
};

// 8. GET MY BOOKINGS
export const getMyBookings = async (customerId: string) => {
  const response = await apiGet(`/packages_bookings/get_bookings.php?customer_id=${customerId}`);
  return response.data;
};

// 9. UPLOAD PAYMENT PROOF
export const uploadPaymentProof = async (
  bookingId: number,
  customerId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("booking_id", bookingId.toString());
  formData.append("customer_id", customerId);
  
  return apiUpload("/packages_bookings/upload_payment_proof.php", formData);
};

// ✅ ADMIN API FUNCTIONS

// GET ALL PACKAGES (untuk admin)
export const getAllPackages = async (params?: {
  search?: string;
  is_active?: string;
  sort_by?: string;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  return apiGet(`/packages/get_packages.php?${queryParams}`);
};

// TOGGLE PACKAGE STATUS
export const togglePackageStatus = async (packageId: number, isActive: boolean) => {
  return apiPost("/packages/update_package.php", {
    package_id: packageId,
    is_active: isActive ? 1 : 0,
  });
};

// DELETE PACKAGE
export const deletePackage = async (packageId: number, forceDelete: boolean = false) => {
  return apiPost("/packages/delete_package.php", {
    package_id: packageId,
    force_delete: forceDelete ? 1 : 0,
  });
};