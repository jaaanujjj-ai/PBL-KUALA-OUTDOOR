// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Mountain, ShoppingCart, Shield, User, LogOut, UserCircle } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";

// export const Navbar = () => {
//   const { user, signOut } = useAuth();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   return (
//     <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
//       <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//         {/* LOGO */}
//         <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-600 hover:text-green-700 transition-colors">
//           <Mountain className="h-7 w-7" />
//           Kuala Outdoor
//         </Link>

//         {/* DESKTOP NAVIGATION */}
//         <div className="hidden md:flex items-center gap-6">
//           <Link to="/browse">
//             <Button variant="ghost" className="hover:text-green-600 transition-colors">
//               Browse Equipment
//             </Button>
//           </Link>
//           <Link to="/packages">
//             <Button variant="ghost" className="hover:text-green-600 transition-colors">
//               Paket Rental
//             </Button>
//           </Link>
//           <Link to="/trips">
//             <Button variant="ghost" className="hover:text-green-600 transition-colors">
//               Open Trip
//             </Button>
//           </Link>
//           <Link to="/about">
//             <Button variant="ghost" className="hover:text-green-600 transition-colors">
//               Tentang Kami
//             </Button>
//           </Link>
//           {/* ADMIN LINK */}
//           <Link to="/admin/login">
//             <Button
//               variant="ghost"
//               className="hover:text-red-600 text-red-500 font-medium transition-colors"
//               title="Admin Portal"
//             >
//               <Shield className="h-4 w-4 mr-1" />
//               Admin
//             </Button>
//           </Link>
//         </div>

//         {/* USER ACTIONS */}
//         <div className="flex items-center gap-3">
//           {/* CART */}
//           <Link to="/cart">
//             <Button variant="outline" size="icon" className="relative">
//               <ShoppingCart className="h-4 w-4" />
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
//                 0
//               </span>
//             </Button>
//           </Link>

//           {/* DESKTOP AUTH & WHATSAPP */}
//           <div className="hidden md:flex items-center gap-2">
//             {!user ? (
//               <>
//                 <Link to="/auth">
//                   <Button variant="outline" className="font-medium">
//                     Masuk
//                   </Button>
//                 </Link>
//               </>
//             ) : (
//               <div className="relative">
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2 font-medium"
//                   onClick={() => setDropdownOpen(!dropdownOpen)}
//                 >
//                   <User className="h-4 w-4" />
//                   <span className="max-w-24 truncate">{user.name || "User"}</span>
//                 </Button>

//                 {dropdownOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
//                     <Link
//                       to="/profile"
//                       onClick={() => setDropdownOpen(false)}
//                       className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                     >
//                       <UserCircle className="h-4 w-4" />
//                       Profil Saya
//                     </Link>
//                     <Link
//                       to="/bookings"
//                       onClick={() => setDropdownOpen(false)}
//                       className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
//                     >
//                       <ShoppingCart className="h-4 w-4" />
//                       Riwayat Booking
//                     </Link>
//                     <button
//                       onClick={() => {
//                         signOut();
//                         setDropdownOpen(false);
//                       }}
//                       className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
//                     >
//                       <LogOut className="h-4 w-4" />
//                       Keluar
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* WHATSAPP */}
//             <a
//               href="https://wa.me/6289692854470"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <Button className="bg-green-600 hover:bg-green-700 text-white font-medium">
//                 WhatsApp
//               </Button>
//             </a>
//           </div>

//           {/* MOBILE MENU */}
//           <div className="md:hidden flex gap-1">
//             <Link to="/browse">
//               <Button variant="outline" size="sm" className="font-medium">
//                 Menu
//               </Button>
//             </Link>
//             <Link to="/admin/login">
//               <Button variant="outline" size="sm" className="text-red-600">
//                 <Shield className="h-3 w-3" />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mountain, ShoppingCart, Shield, User, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext"; // ✅ TAMBAH IMPORT INI

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart(); // ✅ TAMBAH INI
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-600 hover:text-green-700 transition-colors">
          <Mountain className="h-7 w-7" />
          Kuala Outdoor
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/browse">
            <Button variant="ghost" className="hover:text-green-600 transition-colors">
              Browse Equipment
            </Button>
          </Link>
          <Link to="/packages">
            <Button variant="ghost" className="hover:text-green-600 transition-colors">
              Paket Rental
            </Button>
          </Link>
          <Link to="/trips">
            <Button variant="ghost" className="hover:text-green-600 transition-colors">
              Open Trip
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="hover:text-green-600 transition-colors">
              Tentang Kami
            </Button>
          </Link>
          {/* ADMIN LINK */}
          <Link to="/admin/login">
            <Button
              variant="ghost"
              className="hover:text-red-600 text-red-500 font-medium transition-colors"
              title="Admin Portal"
            >
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Button>
          </Link>
        </div>

        {/* USER ACTIONS */}
        <div className="flex items-center gap-3">
          {/* CART - ✅ BADGE SEKARANG DYNAMIC */}
          <Link to="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {getTotalItems() > 0 && ( // ✅ HANYA TAMPIL KALAU ADA ISI
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {getTotalItems()} {/* ✅ PAKAI FUNCTION DARI CONTEXT */}
                </span>
              )}
            </Button>
          </Link>

          {/* DESKTOP AUTH & WHATSAPP */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="font-medium">
                    Masuk
                  </Button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 font-medium"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-24 truncate">{user.name || "User"}</span>
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      Profil Saya
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Riwayat Booking
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* WHATSAPP */}
            <a
              href="https://wa.me/6289692854470"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium">
                WhatsApp
              </Button>
            </a>
          </div>

          {/* MOBILE MENU */}
          <div className="md:hidden flex gap-1">
            <Link to="/browse">
              <Button variant="outline" size="sm" className="font-medium">
                Menu
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="text-red-600">
                <Shield className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};