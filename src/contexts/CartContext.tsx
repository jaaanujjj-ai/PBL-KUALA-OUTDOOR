// import { createContext, useContext, useEffect, useState, useCallback } from 'react'
// import { useAuth } from './AuthContext'

// // ✅ INTERFACE YANG SESUAI DENGAN DATABASE
// export interface EquipmentImage {
//   image_id: number;
//   image_url: string;
//   is_primary: boolean;
//   display_order: number;
// }

// export interface Equipment {
//   equipment_id: number;
//   name: string;
//   code: string;
//   description?: string;
//   category: string;
//   size_capacity?: string;
//   dimensions?: string;
//   weight?: number;
//   material?: string;
//   stock_quantity: number;
//   price_per_day: number;
//   condition: string;
//   equipment_type?: string;
//   image_url?: string;
//   created_at: string;
//   available_stock?: number;
//   reserved_stock?: number;
//   rented_stock?: number;
//   images?: EquipmentImage[];
// }

// export interface CartItem {
//   cart_id?: number;
//   equipment: Equipment;
//   quantity: number;
//   addedAt: Date;
// }

// interface CartContextType {
//   cartItems: CartItem[];
//   addToCart: (equipment: Equipment, quantity?: number) => Promise<void>;
//   removeFromCart: (equipmentId: number) => Promise<void>;
//   updateQuantity: (equipmentId: number, quantity: number) => Promise<void>;
//   clearCart: () => Promise<void>;
//   getTotalItems: () => number;
//   getTotalPrice: () => number;
//   getTotalCost: (duration: number) => number;
//   isInCart: (equipmentId: number) => boolean;
//   getCartItem: (equipmentId: number) => CartItem | undefined;
//   loading: boolean;
//   refreshCart: () => Promise<void>; // ✅ FUNCTION BARU UNTUK REFRESH MANUAL
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost/PBL-KELANA-OUTDOOR/api/public';

// export function CartProvider({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ FUNCTION UNTUK LOAD CART DARI SERVER - BISA DIPANGGIL ULANG
//   const loadCartFromServer = useCallback(async () => {
//     if (!user) {
//       console.log('ℹ️ No user logged in, clearing cart');
//       setCartItems([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log('🔄 Loading cart from server for user:', user.id);
//       setLoading(true);
      
//       const response = await fetch(`${API_BASE}/cart/get.php?customer_id=${user.id}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📥 Cart data from server:', data);
      
//       if (data.success && Array.isArray(data.cart_items)) {
//         const formattedCart = data.cart_items.map((item: any) => {
//           const equipmentData = item.equipment;
          
//           return {
//             cart_id: item.cart_id,
//             equipment: {
//               equipment_id: equipmentData.equipment_id,
//               name: equipmentData.name,
//               code: equipmentData.code,
//               description: equipmentData.description,
//               category: equipmentData.category,
//               size_capacity: equipmentData.size_capacity,
//               dimensions: equipmentData.dimensions,
//               weight: equipmentData.weight,
//               material: equipmentData.material,
//               stock_quantity: equipmentData.stock_quantity,
//               price_per_day: equipmentData.price_per_day,
//               condition: equipmentData.condition,
//               equipment_type: equipmentData.equipment_type,
//               image_url: equipmentData.image_url,
//               created_at: equipmentData.created_at,
//               available_stock: equipmentData.available_stock || equipmentData.stock_quantity,
//               reserved_stock: equipmentData.reserved_stock || 0,
//               rented_stock: equipmentData.rented_stock || 0,
//               images: equipmentData.images || []
//             },
//             quantity: item.quantity,
//             addedAt: new Date(item.added_at)
//           };
//         });
        
//         setCartItems(formattedCart);
//         console.log('✅ Cart loaded from database:', formattedCart.length, 'items');
//       } else {
//         setCartItems([]);
//         console.log('ℹ️ No cart items found in database');
//       }
//     } catch (error) {
//       console.error('❌ Error loading cart from database:', error);
//       setCartItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   // ✅ LOAD CART SAAT PERTAMA KALI ATAU USER BERUBAH
//   useEffect(() => {
//     loadCartFromServer();
//   }, [loadCartFromServer]);

//   // ✅ ADD TO CART
//   const addToCart = async (equipment: Equipment, quantity: number = 1): Promise<void> => {
//     if (!user) {
//       throw new Error('Anda harus login terlebih dahulu!');
//     }

//     if (equipment.stock_quantity <= 0) {
//       throw new Error('Item tidak dapat ditambahkan karena stok habis');
//     }

//     try {
//       console.log('🛒 Adding to cart via API:', equipment.name, 'qty:', quantity);
      
//       const response = await fetch(`${API_BASE}/cart/add.php`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customer_id: parseInt(user.id),
//           equipment_id: equipment.equipment_id,
//           quantity: quantity
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📥 Add to cart response:', data);
      
//       if (data.success) {
//         // ✅ RELOAD CART SETELAH BERHASIL UNTUK REAL-TIME UPDATE
//         await loadCartFromServer();
//         console.log('✅ Cart updated from database');
//       } else {
//         throw new Error(data.message || 'Gagal menambahkan ke keranjang');
//       }
//     } catch (error: any) {
//       console.error('❌ Error adding to cart:', error);
//       throw error;
//     }
//   };

//   // ✅ REMOVE FROM CART
//   const removeFromCart = async (equipmentId: number): Promise<void> => {
//     if (!user) {
//       throw new Error('User not logged in');
//     }

//     try {
//       console.log('🗑️ Removing from cart via API:', equipmentId);
      
//       const response = await fetch(`${API_BASE}/cart/delete.php`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customer_id: parseInt(user.id),
//           equipment_id: equipmentId
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📥 Remove from cart response:', data);
      
//       if (data.success) {
//         // ✅ RELOAD CART SETELAH BERHASIL UNTUK REAL-TIME UPDATE
//         await loadCartFromServer();
//         console.log('✅ Item removed from cart');
//       } else {
//         throw new Error(data.message || 'Gagal menghapus item');
//       }
//     } catch (error: any) {
//       console.error('❌ Error removing from cart:', error);
//       throw error;
//     }
//   };

//   // ✅ UPDATE QUANTITY
//   const updateQuantity = async (equipmentId: number, quantity: number): Promise<void> => {
//     if (!user) {
//       throw new Error('User not logged in');
//     }

//     try {
//       console.log('🔢 Updating quantity via API:', equipmentId, 'to', quantity);
      
//       const response = await fetch(`${API_BASE}/cart/update.php`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customer_id: parseInt(user.id),
//           equipment_id: equipmentId,
//           quantity: quantity
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📥 Update quantity response:', data);
      
//       if (data.success) {
//         // ✅ RELOAD CART SETELAH BERHASIL UNTUK REAL-TIME UPDATE
//         await loadCartFromServer();
//         console.log('✅ Quantity updated in database');
//       } else {
//         throw new Error(data.message || 'Gagal update quantity');
//       }
//     } catch (error: any) {
//       console.error('❌ Error updating quantity:', error);
//       throw error;
//     }
//   };

//   // ✅ CLEAR CART
//   const clearCart = async (): Promise<void> => {
//     if (!user) {
//       throw new Error('User not logged in');
//     }

//     try {
//       console.log('🧹 Clearing cart via API');
      
//       const deletePromises = cartItems.map(item =>
//         fetch(`${API_BASE}/cart/delete.php`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             customer_id: parseInt(user.id),
//             equipment_id: item.equipment.equipment_id
//           })
//         })
//       );
      
//       await Promise.all(deletePromises);
//       // ✅ RELOAD CART SETELAH BERHASIL UNTUK REAL-TIME UPDATE
//       await loadCartFromServer();
//       console.log('✅ Cart cleared from database');
//     } catch (error: any) {
//       console.error('❌ Error clearing cart:', error);
//       throw error;
//     }
//   };

//   // ✅ REFRESH CART MANUAL
//   const refreshCart = async (): Promise<void> => {
//     await loadCartFromServer();
//   };

//   // ✅ HELPER FUNCTIONS
//   const getTotalItems = () => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   };
  
//   const getTotalPrice = () => {
//     return cartItems.reduce(
//       (total, item) => total + (item.equipment.price_per_day * item.quantity), 
//       0
//     );
//   };

//   const getTotalCost = (duration: number) => {
//     return cartItems.reduce(
//       (total, item) => total + (item.equipment.price_per_day * item.quantity * duration), 
//       0
//     );
//   };

//   const isInCart = (equipmentId: number) => {
//     return cartItems.some(item => item.equipment.equipment_id === equipmentId);
//   };

//   const getCartItem = (equipmentId: number) => {
//     return cartItems.find(item => item.equipment.equipment_id === equipmentId);
//   };

//   const value: CartContextType = {
//     cartItems,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getTotalItems,
//     getTotalPrice,
//     getTotalCost,
//     isInCart,
//     getCartItem,
//     loading,
//     refreshCart // ✅ EXPOSE REFRESH FUNCTION
//   };

//   return (
//     <CartContext.Provider value={value}>
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (context === undefined) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// }

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

// ✅ INTERFACE YANG SESUAI DENGAN DATABASE
export interface EquipmentImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Equipment {
  equipment_id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  size_capacity?: string;
  dimensions?: string;
  weight?: number;
  material?: string;
  stock_quantity: number;
  price_per_day: number;
  condition: string;
  equipment_type?: string;
  image_url?: string;
  created_at: string;
  available_stock?: number;
  reserved_stock?: number;
  rented_stock?: number;
  images?: EquipmentImage[];
}

export interface CartItem {
  cart_id?: number;
  equipment: Equipment;
  quantity: number;
  addedAt: Date;
}

// ✅ TAMBAH INTERFACE UNTUK PACKAGE CART (HANYA UNTUK COUNT)
export interface PackageCartItem {
  cart_id: number;
  package_id: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  packageCartItems: PackageCartItem[]; // ✅ TAMBAH INI
  addToCart: (equipment: Equipment, quantity?: number) => Promise<void>;
  removeFromCart: (equipmentId: number) => Promise<void>;
  updateQuantity: (equipmentId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number; // ✅ SEKARANG HITUNG EQUIPMENT + PACKAGE
  getTotalPrice: () => number;
  getTotalCost: (duration: number) => number;
  isInCart: (equipmentId: number) => boolean;
  getCartItem: (equipmentId: number) => CartItem | undefined;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost/PBL-KELANA-OUTDOOR/api/public';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [packageCartItems, setPackageCartItems] = useState<PackageCartItem[]>([]); // ✅ STATE BARU
  const [loading, setLoading] = useState(true);

  // ✅ LOAD CART DARI SERVER (EQUIPMENT + PACKAGE)
  const loadCartFromServer = useCallback(async () => {
    if (!user) {
      console.log('ℹ️ No user logged in, clearing cart');
      setCartItems([]);
      setPackageCartItems([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading cart from server for user:', user.id);
      setLoading(true);
      
      // ✅ LOAD EQUIPMENT CART (LOGIC EXISTING - TIDAK BERUBAH)
      const response = await fetch(`${API_BASE}/cart/get.php?customer_id=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Equipment cart data:', data);
      
      if (data.success && Array.isArray(data.cart_items)) {
        const formattedCart = data.cart_items.map((item: any) => {
          const equipmentData = item.equipment;
          
          return {
            cart_id: item.cart_id,
            equipment: {
              equipment_id: equipmentData.equipment_id,
              name: equipmentData.name,
              code: equipmentData.code,
              description: equipmentData.description,
              category: equipmentData.category,
              size_capacity: equipmentData.size_capacity,
              dimensions: equipmentData.dimensions,
              weight: equipmentData.weight,
              material: equipmentData.material,
              stock_quantity: equipmentData.stock_quantity,
              price_per_day: equipmentData.price_per_day,
              condition: equipmentData.condition,
              equipment_type: equipmentData.equipment_type,
              image_url: equipmentData.image_url,
              created_at: equipmentData.created_at,
              available_stock: equipmentData.available_stock || equipmentData.stock_quantity,
              reserved_stock: equipmentData.reserved_stock || 0,
              rented_stock: equipmentData.rented_stock || 0,
              images: equipmentData.images || []
            },
            quantity: item.quantity,
            addedAt: new Date(item.added_at)
          };
        });
        
        setCartItems(formattedCart);
        console.log('✅ Equipment cart loaded:', formattedCart.length, 'items');
      } else {
        setCartItems([]);
        console.log('ℹ️ No equipment cart items');
      }

      // ✅ LOAD PACKAGE CART (HANYA UNTUK COUNT BADGE)
      try {
        const packageResponse = await fetch(
          `http://localhost/PBL-KELANA-OUTDOOR/api/customer/package-cart.php?customer_id=${user.id}`
        );
        
        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          console.log('📦 Package cart data:', packageData);
          
          if (packageData.success && Array.isArray(packageData.data)) {
            // ✅ AMBIL HANYA DATA MINIMAL (cart_id, package_id, quantity)
            const packageCount = packageData.data.map((item: any) => ({
              cart_id: item.cart_id,
              package_id: item.package_id,
              quantity: item.quantity
            }));
            
            setPackageCartItems(packageCount);
            console.log('✅ Package cart loaded:', packageCount.length, 'items');
          } else {
            setPackageCartItems([]);
          }
        } else {
          setPackageCartItems([]);
        }
      } catch (packageError) {
        console.log('⚠️ Package cart not available:', packageError);
        setPackageCartItems([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading cart from database:', error);
      setCartItems([]);
      setPackageCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ LOAD CART SAAT PERTAMA KALI ATAU USER BERUBAH
  useEffect(() => {
    loadCartFromServer();
  }, [loadCartFromServer]);

  // ✅ ADD TO CART (TIDAK BERUBAH)
  const addToCart = async (equipment: Equipment, quantity: number = 1): Promise<void> => {
    if (!user) {
      throw new Error('Anda harus login terlebih dahulu!');
    }

    if (equipment.stock_quantity <= 0) {
      throw new Error('Item tidak dapat ditambahkan karena stok habis');
    }

    try {
      console.log('🛒 Adding to cart via API:', equipment.name, 'qty:', quantity);
      
      const response = await fetch(`${API_BASE}/cart/add.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(user.id),
          equipment_id: equipment.equipment_id,
          quantity: quantity
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Add to cart response:', data);
      
      if (data.success) {
        await loadCartFromServer();
        console.log('✅ Cart updated from database');
      } else {
        throw new Error(data.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  };

  // ✅ REMOVE FROM CART (TIDAK BERUBAH)
  const removeFromCart = async (equipmentId: number): Promise<void> => {
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      console.log('🗑️ Removing from cart via API:', equipmentId);
      
      const response = await fetch(`${API_BASE}/cart/delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(user.id),
          equipment_id: equipmentId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Remove from cart response:', data);
      
      if (data.success) {
        await loadCartFromServer();
        console.log('✅ Item removed from cart');
      } else {
        throw new Error(data.message || 'Gagal menghapus item');
      }
    } catch (error: any) {
      console.error('❌ Error removing from cart:', error);
      throw error;
    }
  };

  // ✅ UPDATE QUANTITY (TIDAK BERUBAH)
  const updateQuantity = async (equipmentId: number, quantity: number): Promise<void> => {
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      console.log('🔢 Updating quantity via API:', equipmentId, 'to', quantity);
      
      const response = await fetch(`${API_BASE}/cart/update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(user.id),
          equipment_id: equipmentId,
          quantity: quantity
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Update quantity response:', data);
      
      if (data.success) {
        await loadCartFromServer();
        console.log('✅ Quantity updated in database');
      } else {
        throw new Error(data.message || 'Gagal update quantity');
      }
    } catch (error: any) {
      console.error('❌ Error updating quantity:', error);
      throw error;
    }
  };

  // ✅ CLEAR CART (TIDAK BERUBAH)
  const clearCart = async (): Promise<void> => {
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      console.log('🧹 Clearing cart via API');
      
      const deletePromises = cartItems.map(item =>
        fetch(`${API_BASE}/cart/delete.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: parseInt(user.id),
            equipment_id: item.equipment.equipment_id
          })
        })
      );
      
      await Promise.all(deletePromises);
      await loadCartFromServer();
      console.log('✅ Cart cleared from database');
    } catch (error: any) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    }
  };

  // ✅ REFRESH CART MANUAL
  const refreshCart = async (): Promise<void> => {
    await loadCartFromServer();
  };

  // ✅ GET TOTAL ITEMS - SEKARANG HITUNG EQUIPMENT + PACKAGE
  const getTotalItems = () => {
    const equipmentTotal = cartItems.reduce((total, item) => total + item.quantity, 0);
    const packageTotal = packageCartItems.reduce((total, item) => total + item.quantity, 0);
    const grandTotal = equipmentTotal + packageTotal;
    
    console.log('📊 Cart badge count:', {
      equipment: equipmentTotal,
      package: packageTotal,
      total: grandTotal
    });
    
    return grandTotal;
  };
  
  // ✅ GET TOTAL PRICE (TIDAK BERUBAH - HANYA EQUIPMENT)
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + (item.equipment.price_per_day * item.quantity), 
      0
    );
  };

  // ✅ GET TOTAL COST (TIDAK BERUBAH - HANYA EQUIPMENT)
  const getTotalCost = (duration: number) => {
    return cartItems.reduce(
      (total, item) => total + (item.equipment.price_per_day * item.quantity * duration), 
      0
    );
  };

  const isInCart = (equipmentId: number) => {
    return cartItems.some(item => item.equipment.equipment_id === equipmentId);
  };

  const getCartItem = (equipmentId: number) => {
    return cartItems.find(item => item.equipment.equipment_id === equipmentId);
  };

  const value: CartContextType = {
    cartItems,
    packageCartItems, // ✅ EXPOSE PACKAGE CART
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems, // ✅ SEKARANG RETURN EQUIPMENT + PACKAGE COUNT
    getTotalPrice,
    getTotalCost,
    isInCart,
    getCartItem,
    loading,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}