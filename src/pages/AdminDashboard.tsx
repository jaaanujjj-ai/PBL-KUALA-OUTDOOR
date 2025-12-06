// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   LogOut,
//   Package,
//   Users,
//   TrendingUp,
//   Calendar,
//   DollarSign,
//   AlertCircle,
//   Mountain,
//   Shirt,
//   Phone,
//   Loader2,
//   Gift, // ✅ Icon untuk Package Management
// } from "lucide-react";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({
//     totalBookings: 0,
//     activeBookings: 0,
//     totalEquipment: 0,
//     availableEquipment: 0,
//     totalCustomers: 0,
//     totalRevenue: 0,
//     pendingBookings: 0,
//     totalPackages: 0, // ✅ TAMBAHKAN
//     activePackages: 0, // ✅ TAMBAHKAN
//   });
//   const [loading, setLoading] = useState(true);

//   // FETCH STATS FROM API
//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       setLoading(true);
      
//       // TODO: Fetch dari API yang sebenarnya
//       // Sementara ini hardcode dulu
//       setStats({
//         totalBookings: 127,
//         activeBookings: 23,
//         totalEquipment: 156,
//         availableEquipment: 98,
//         totalCustomers: 89,
//         totalRevenue: 45000000,
//         pendingBookings: 8,
//         totalPackages: 12, // ✅ TAMBAHKAN
//         activePackages: 10, // ✅ TAMBAHKAN
//       });
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userRole");
//     navigate("/admin/login");
//   };

//   // ✅ MENU DATA (TAMBAHKAN PAKET RENTAL)
//   const menus = [
//     {
//       to: "/admin/bookings",
//       icon: <Calendar className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />,
//       bg: "bg-blue-100 group-hover:bg-blue-500",
//       border: "hover:border-blue-400",
//       title: "Kelola Booking",
//       color: "group-hover:text-blue-600",
//       desc: "Konfirmasi dan tracking booking",
//       badge: stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : null
//     },
//     {
//       to: "/admin/equipment",
//       icon: <Package className="h-10 w-10 text-green-600 group-hover:text-white transition-colors" />,
//       bg: "bg-green-100 group-hover:bg-green-500",
//       border: "hover:border-green-400",
//       title: "Kelola Equipment",
//       color: "group-hover:text-green-600",
//       desc: "Tambah dan edit equipment"
//     },
//     // ✅ TAMBAHKAN MENU PACKAGE MANAGEMENT
//     {
//       to: "/admin/packages",
//       icon: <Gift className="h-10 w-10 text-orange-600 group-hover:text-white transition-colors" />,
//       bg: "bg-orange-100 group-hover:bg-orange-500",
//       border: "hover:border-orange-400",
//       title: "Kelola Paket Rental",
//       color: "group-hover:text-orange-600",
//       desc: "Atur paket rental equipment",
//       badge: stats.activePackages > 0 ? `${stats.activePackages} aktif` : null
//     },
//     {
//       to: "/admin/customers",
//       icon: <Users className="h-10 w-10 text-purple-600 group-hover:text-white transition-colors" />,
//       bg: "bg-purple-100 group-hover:bg-purple-500",
//       border: "hover:border-purple-400",
//       title: "Kelola Customer",
//       color: "group-hover:text-purple-600",
//       desc: "Data customer dan history"
//     },
//     {
//       to: "/admin/trips",
//       icon: <Mountain className="h-10 w-10 text-emerald-600 group-hover:text-white transition-colors" />,
//       bg: "bg-emerald-100 group-hover:bg-emerald-500",
//       border: "hover:border-emerald-400",
//       title: "Kelola Open Trip",
//       color: "group-hover:text-emerald-600",
//       desc: "Tambah dan edit trip"
//     },
//     {
//       to: "/admin/merchandise",
//       icon: <Shirt className="h-10 w-10 text-orange-600 group-hover:text-white transition-colors" />,
//       bg: "bg-orange-100 group-hover:bg-orange-500",
//       border: "hover:border-orange-400",
//       title: "Kelola Merchandise",
//       color: "group-hover:text-orange-600",
//       desc: "Tambah dan edit merchandise"
//     },
//     {
//       to: "/admin/contact",
//       icon: <Phone className="h-10 w-10 text-cyan-600 group-hover:text-white transition-colors" />,
//       bg: "bg-cyan-100 group-hover:bg-cyan-500",
//       border: "hover:border-cyan-400",
//       title: "Kelola Kontak",
//       color: "group-hover:text-cyan-600",
//       desc: "Ubah nomor telepon & info kontak"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* HEADER */}
//       <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
//         <div className="container mx-auto px-6 py-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//               <p className="text-orange-100 mt-1">Kelola semua data Kuala Outdoor</p>
//             </div>
//             <Button
//               variant="outline"
//               className="bg-white text-orange-600 hover:bg-orange-50 border-2 border-white"
//               onClick={handleLogout}
//             >
//               <LogOut className="mr-2 h-4 w-4" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto p-6">
//         {/* STATISTICS CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {/* Total Bookings */}
//           <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-600">
//                 Total Booking
//               </CardTitle>
//               <Calendar className="h-5 w-5 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-blue-600 mb-2">
//                 {loading ? (
//                   <Loader2 className="h-8 w-8 animate-spin" />
//                 ) : (
//                   stats.totalBookings
//                 )}
//               </div>
//               <p className="text-xs text-gray-500">
//                 {stats.activeBookings} booking aktif
//               </p>
//             </CardContent>
//           </Card>

//           {/* Total Equipment */}
//           <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-600">
//                 Total Equipment
//               </CardTitle>
//               <Package className="h-5 w-5 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-green-600 mb-2">
//                 {loading ? (
//                   <Loader2 className="h-8 w-8 animate-spin" />
//                 ) : (
//                   stats.totalEquipment
//                 )}
//               </div>
//               <p className="text-xs text-gray-500">
//                 {stats.availableEquipment} tersedia
//               </p>
//             </CardContent>
//           </Card>

//           {/* ✅ TAMBAHKAN CARD PACKAGE */}
//           <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-600">
//                 Paket Rental
//               </CardTitle>
//               <Gift className="h-5 w-5 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-orange-600 mb-2">
//                 {loading ? (
//                   <Loader2 className="h-8 w-8 animate-spin" />
//                 ) : (
//                   stats.totalPackages
//                 )}
//               </div>
//               <p className="text-xs text-gray-500">
//                 {stats.activePackages} paket aktif
//               </p>
//             </CardContent>
//           </Card>

//           {/* Total Customers */}
//           <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-600">
//                 Total Customer
//               </CardTitle>
//               <Users className="h-5 w-5 text-purple-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-purple-600 mb-2">
//                 {loading ? (
//                   <Loader2 className="h-8 w-8 animate-spin" />
//                 ) : (
//                   stats.totalCustomers
//                 )}
//               </div>
//               <p className="text-xs text-gray-500">Customer terdaftar</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* REVENUE & PENDING ALERTS */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Total Revenue */}
//           <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <DollarSign className="h-6 w-6 text-green-600" />
//                 <span className="text-gray-700">Total Pendapatan</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-4xl font-bold text-green-600 mb-2">
//                 {loading ? (
//                   <Loader2 className="h-10 w-10 animate-spin" />
//                 ) : (
//                   `Rp ${stats.totalRevenue.toLocaleString()}`
//                 )}
//               </div>
//               <div className="flex items-center gap-2 text-sm text-green-700">
//                 <TrendingUp className="h-4 w-4" />
//                 <span>+12% dari bulan lalu</span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Pending Bookings Alert */}
//           <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <AlertCircle className="h-6 w-6 text-yellow-600" />
//                 <span className="text-gray-700">Booking Pending</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-4xl font-bold text-yellow-600 mb-2">
//                 {loading ? (
//                   <Loader2 className="h-10 w-10 animate-spin" />
//                 ) : (
//                   stats.pendingBookings
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 Booking menunggu konfirmasi admin
//               </p>
//               <Link to="/admin/bookings">
//                 <Button
//                   variant="outline"
//                   className="mt-4 border-yellow-400 text-yellow-700 hover:bg-yellow-100"
//                 >
//                   Lihat Detail
//                 </Button>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>

//         {/* MENU CARDS */}
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu Management</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {menus.map((menu, index) => (
//               <Link key={index} to={menu.to}>
//                 <Card
//                   className={`group cursor-pointer border-2 ${menu.border} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden`}
//                 >
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
                  
//                   <CardContent className="p-6 relative z-10">
//                     <div className="flex items-start gap-4">
//                       <div
//                         className={`${menu.bg} p-4 rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300`}
//                       >
//                         {menu.icon}
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-bold text-lg text-gray-800 group-hover:text-gray-900 mb-1">
//                           {menu.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 group-hover:text-gray-700">
//                           {menu.desc}
//                         </p>
//                         {menu.badge && (
//                           <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
//                             {menu.badge}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* QUICK INFO */}
//         <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
//           <CardHeader>
//             <CardTitle className="text-gray-700">Informasi Cepat</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
//                 <Calendar className="h-8 w-8 text-blue-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">Booking Hari Ini</p>
//                   <p className="text-xl font-bold text-blue-600">12</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//                 <Package className="h-8 w-8 text-green-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">Equipment Tersedia</p>
//                   <p className="text-xl font-bold text-green-600">{stats.availableEquipment}</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
//                 <Gift className="h-8 w-8 text-orange-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">Paket Populer</p>
//                   <p className="text-xl font-bold text-orange-600">5</p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Package,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  Mountain,
  Shirt,
  Phone,
  Loader2,
  Gift, // ✅ TAMBAH ICON INI
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  // FETCH STATS FROM API
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch Bookings
      const bookingsRes = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/admin/bookings.php');
      const bookingsData = await bookingsRes.json();
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];

      // Fetch Equipment
      const equipmentRes = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php');
      const equipmentData = await equipmentRes.json();
      const equipment = Array.isArray(equipmentData) ? equipmentData : [];

      // Calculate stats
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const completedBookings = bookings.filter(b => b.status === 'completed');

      const totalRevenue = completedBookings.reduce((sum, booking) => {
        return sum + (parseFloat(booking.total_actual_cost) || parseFloat(booking.total_estimated_cost) || 0);
      }, 0);

      const totalEquipment = equipment.length;
      const availableEquipment = equipment.filter(e => (e.available_stock || e.stock_quantity) > 0).length;

      const uniqueCustomers = new Set(bookings.map(b => b.customer_name).filter(Boolean));
      const totalCustomers = uniqueCustomers.size;

      setStats({
        totalBookings,
        activeBookings,
        totalEquipment,
        availableEquipment,
        totalCustomers,
        totalRevenue,
        pendingBookings,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  // STATS CARDS WITH REAL DATA
  const statsCards = [
    { 
      label: "Total Booking", 
      value: loading ? "..." : stats.totalBookings.toString(),
      subValue: `${stats.activeBookings} aktif`,
      icon: Calendar, 
      color: "bg-blue-500", 
      link: "/admin/bookings"
    },
    { 
      label: "Equipment", 
      value: loading ? "..." : stats.totalEquipment.toString(),
      subValue: `${stats.availableEquipment} tersedia`,
      icon: Package, 
      color: "bg-green-500", 
      link: "/admin/equipment"
    },
    { 
      label: "Customers", 
      value: loading ? "..." : stats.totalCustomers.toString(),
      subValue: "registered",
      icon: Users, 
      color: "bg-purple-500", 
      link: "/admin/customers"
    },
    { 
      label: "Revenue", 
      value: loading ? "..." : `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}jt`,
      subValue: "completed bookings",
      icon: DollarSign, 
      color: "bg-yellow-500", 
      link: "/admin/bookings"
    },
  ];

  // ✅ Menu data - TAMBAH KELOLA PAKET RENTAL
  const menus = [
    {
      to: "/admin/bookings",
      icon: <Calendar className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />,
      bg: "bg-blue-100 group-hover:bg-blue-500",
      border: "hover:border-blue-400",
      title: "Kelola Booking",
      color: "group-hover:text-blue-600",
      desc: "Konfirmasi dan tracking booking",
      badge: stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : null
    },
    {
      to: "/admin/equipment",
      icon: <Package className="h-10 w-10 text-green-600 group-hover:text-white transition-colors" />,
      bg: "bg-green-100 group-hover:bg-green-500",
      border: "hover:border-green-400",
      title: "Kelola Equipment",
      color: "group-hover:text-green-600",
      desc: "Tambah dan edit equipment"
    },
    // ✅ TAMBAH MENU INI
    {
      to: "/admin/packages",
      icon: <Gift className="h-10 w-10 text-orange-600 group-hover:text-white transition-colors" />,
      bg: "bg-orange-100 group-hover:bg-orange-500",
      border: "hover:border-orange-400",
      title: "Kelola Paket Rental",
      color: "group-hover:text-orange-600",
      desc: "Atur dan kelola paket rental equipment outdoor"
    },
    {
      to: "/admin/customers",
      icon: <Users className="h-10 w-10 text-purple-600 group-hover:text-white transition-colors" />,
      bg: "bg-purple-100 group-hover:bg-purple-500",
      border: "hover:border-purple-400",
      title: "Kelola Customer",
      color: "group-hover:text-purple-600",
      desc: "Data customer dan history"
    },
    {
      to: "/admin/trips",
      icon: <Mountain className="h-10 w-10 text-emerald-600 group-hover:text-white transition-colors" />,
      bg: "bg-emerald-100 group-hover:bg-emerald-500",
      border: "hover:border-emerald-400",
      title: "Kelola Open Trip",
      color: "group-hover:text-emerald-600",
      desc: "Tambah dan edit trip"
    },
    {
      to: "/admin/merchandise",
      icon: <Shirt className="h-10 w-10 text-orange-600 group-hover:text-white transition-colors" />,
      bg: "bg-orange-100 group-hover:bg-orange-500",
      border: "hover:border-orange-400",
      title: "Kelola Merchandise",
      color: "group-hover:text-orange-600",
      desc: "Tambah dan edit merchandise"
    },
    {
      to: "/admin/contact",
      icon: <Phone className="h-10 w-10 text-cyan-600 group-hover:text-white transition-colors" />,
      bg: "bg-cyan-100 group-hover:bg-cyan-500",
      border: "hover:border-cyan-400",
      title: "Kelola Kontak",
      color: "group-hover:text-cyan-600",
      desc: "Ubah nomor telepon & info kontak"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Kuala Outdoor Management System</p>
            </div>
            <div className="flex gap-2 items-center">
              <Button 
                onClick={fetchDashboardStats}
                variant="outline"
                className="gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            const borderColorClass = stat.color.replace("bg-", "border-");
            return (
              <Link to={stat.link} key={index}>
                <Card
                  className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${borderColorClass} cursor-pointer`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          ) : (
                            stat.value
                          )}
                        </h3>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-gray-500">{stat.subValue}</span>
                        </div>
                      </div>
                      <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Access Menu */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          Quick Access Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {menus.map((menu, idx) => (
            <Link to={menu.to} className="group" key={idx}>
              <Card className={`border-2 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${menu.border} relative`}>
                {menu.badge && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                    {menu.badge}
                  </div>
                )}
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className={`w-24 h-24 ${menu.bg} rounded-full flex items-center justify-center mb-6 transition-colors`}>
                    {menu.icon}
                  </div>
                  <h3 className={`font-semibold text-xl mb-2 ${menu.color} transition-colors text-center`}>
                    {menu.title}
                  </h3>
                  <p className="text-gray-600 text-base text-center">{menu.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Booking Summary */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-5 w-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="font-bold text-yellow-600">{stats.pendingBookings}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium">Active</span>
                  <span className="font-bold text-green-600">{stats.activeBookings}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold text-gray-600">{stats.totalBookings}</span>
                </div>
              </div>
              <Link to="/admin/bookings">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Lihat Semua Booking
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Equipment Summary */}
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Package className="h-5 w-5" />
                Equipment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium">Tersedia</span>
                  <span className="font-bold text-green-600">{stats.availableEquipment}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-sm font-medium">Disewa</span>
                  <span className="font-bold text-red-600">{stats.totalEquipment - stats.availableEquipment}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold text-gray-600">{stats.totalEquipment}</span>
                </div>
              </div>
              <Link to="/admin/equipment">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  Lihat Semua Equipment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <DollarSign className="h-6 w-6" />
              Total Revenue (Completed Bookings)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {loading ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`
              )}
            </div>
            <p className="text-gray-600">
              Dari {stats.totalBookings} total booking yang terdaftar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;