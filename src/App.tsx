import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ CONTEXTS
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ContactProvider } from "./contexts/ContactContext";

// ✅ PUBLIC PAGES
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EquipmentDetail from "./pages/EquipmentDetail";
import BookingForm from "./pages/BookingForm";
import CartPage from "./pages/CartPage";
import Packages from "./pages/Packages";
import Trips from "./pages/Trips";
import About from "./pages/About";
import TambahEquipment from './pages/TambahEquipment'
import Merchandise from "./pages/Merchandise";
import ContactManagement from "./pages/ContactManagement";

import TripDetailPage from "./pages/TripDetailPage";
import TripManagement from "./pages/TripManagement";
import TripForm from "./pages/TripForm";

// ✅ ADMIN PAGES
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BookingDetail from "./pages/BookingDetail";
import BookingManagement from "./pages/BookingManagement";
import EquipmentManagement from "./pages/EquipmentManagement";
import PackageManagement from "./pages/PackageManagement"; // ✅ TAMBAHKAN INI
import { ProtectedRoute } from "./components/ProtectedRoute";

import { GoogleOAuthProvider } from '@react-oauth/google';

// ✅ TEMPORARY BOOKINGS COMPONENT
const Bookings = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Riwayat Booking</h1>
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Belum ada riwayat booking</p>
        <p className="text-gray-400 text-sm mt-2">Booking pertama Anda akan muncul di sini</p>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

// ✅ GOOGLE CLIENT ID - Pastikan ini benar
const GOOGLE_CLIENT_ID = "674921949545-ked4b0t7aml2tc3adqa6h0dlsmnh8g2n.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ContactProvider>
            <AuthProvider>
              <CartProvider>
                <Routes>
                  {/* ✅ PUBLIC ROUTES */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/trips/:id" element={<TripDetailPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/equipment/:id" element={<EquipmentDetail />} />
                  <Route path="/booking/form" element={<BookingForm />} />
                  <Route path="/tambah-equipment" element={<TambahEquipment />} />
                  <Route path="/merchandise" element={<Merchandise />} />

                  {/* ✅ ADMIN ROUTES */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/bookings" 
                    element={
                      <ProtectedRoute>
                        <BookingManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/bookings/:bookingId" 
                    element={
                      <ProtectedRoute>
                        <BookingDetail />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/equipment" 
                    element={
                      <ProtectedRoute>
                        <EquipmentManagement />
                      </ProtectedRoute>
                    } 
                  />

                  {/* ✅ PACKAGE MANAGEMENT ROUTE - TAMBAHKAN INI */}
                  <Route 
                    path="/admin/packages" 
                    element={
                      <ProtectedRoute>
                        <PackageManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* ✅ Contact Management */}
                  <Route 
                    path="/admin/contact" 
                    element={
                      <ProtectedRoute>
                        <ContactManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* ✅ Open Trip & Trip Management */}
                  <Route 
                    path="/admin/trips" 
                    element={
                      <ProtectedRoute>
                        <TripManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/trips/new" 
                    element={
                      <ProtectedRoute>
                        <TripForm />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/trips/:id/edit" 
                    element={
                      <ProtectedRoute>
                        <TripForm />
                      </ProtectedRoute>
                    } 
                  />

                  {/* ✅ 404 PAGE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </AuthProvider>
          </ContactProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;