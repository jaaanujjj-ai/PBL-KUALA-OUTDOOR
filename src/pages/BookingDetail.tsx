import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Package,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Box
} from "lucide-react";

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/PBL-KELANA-OUTDOOR/api/admin/booking_detail.php?booking_id=${bookingId}`);
      const data = await response.json();
      
      console.log('📦 Booking Detail Response:', data); // DEBUG
      
      if (data.success) {
        setBooking(data.data);
      } else {
        alert('Gagal memuat detail booking');
        navigate('/admin/bookings');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saat memuat data');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'unpaid': return 'bg-red-500';
      case 'partial': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'active': return 'Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'unpaid': return 'Belum Bayar';
      case 'partial': return 'DP Paid';
      case 'paid': return 'Lunas';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Memuat detail booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Booking tidak ditemukan</p>
          <Button onClick={() => navigate('/admin/bookings')} className="mt-4">
            Kembali ke Daftar Booking
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/bookings')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Booking</h1>
                <p className="text-gray-600">{booking.booking_code}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge className={`${getStatusColor(booking.status)} text-white`}>
                {getStatusText(booking.status)}
              </Badge>
              <Badge className={`${getPaymentStatusColor(booking.payment_status)} text-white`}>
                {getPaymentStatusText(booking.payment_status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* INFORMASI PENYEWA */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Penyewa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Nama Lengkap</label>
                <p className="font-semibold text-gray-900">{booking.customer_name || '-'}</p>
              </div>
              
              {booking.customer_identity_number && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    No. KTP/Identitas
                  </label>
                  <p className="font-semibold text-gray-900">{booking.customer_identity_number}</p>
                </div>
              )}
              
              {booking.customer_phone && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    No. Telepon
                  </label>
                  <p className="font-semibold text-gray-900">{booking.customer_phone}</p>
                  <a 
                    href={`https://wa.me/${booking.customer_phone.replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline"
                  >
                    📱 Hubungi via WhatsApp
                  </a>
                </div>
              )}
              
              {booking.customer_email && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="font-semibold text-gray-900">{booking.customer_email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DETAIL BOOKING & EQUIPMENT */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detail Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* PERIODE RENTAL */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600">Tanggal Mulai</label>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.start_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tanggal Selesai</label>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.end_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Durasi Sewa
                  </label>
                  <p className="font-bold text-xl text-blue-600">
                    {booking.estimated_duration} Hari
                  </p>
                </div>
              </div>

              {/* ✅ EQUIPMENT ITEMS (PER ITEM) */}
              {booking.equipment_items && booking.equipment_items.length > 0 && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <Package className="h-4 w-4" />
                    Equipment yang Disewa (Per Item)
                  </label>
                  <div className="space-y-2">
                    {booking.equipment_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-900">{item.equipment_name}</p>
                          <p className="text-sm text-gray-600">
                            Rp {Number(item.price_per_day).toLocaleString('id-ID')}/hari × {item.quantity} unit
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            Rp {(Number(item.price_per_day) * item.quantity * booking.estimated_duration).toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-500">{booking.estimated_duration} hari</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ PACKAGE ITEMS (PAKET + ITEMS DI DALAMNYA) */}
              {booking.package_items && booking.package_items.length > 0 && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <Box className="h-4 w-4" />
                    Paket yang Disewa
                  </label>
                  <div className="space-y-4">
                    {booking.package_items.map((pkg, pkgIndex) => (
                      <div key={pkgIndex} className="border-2 border-orange-200 rounded-lg overflow-hidden">
                        {/* HEADER PAKET */}
                        <div className="bg-orange-50 p-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg text-gray-900">{pkg.package_name}</p>
                            <p className="text-sm text-gray-600">
                              Rp {Number(pkg.price_per_day).toLocaleString('id-ID')}/hari × {pkg.quantity} paket
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-orange-500 text-white mb-1">PAKET</Badge>
                            <p className="font-bold text-lg text-green-600">
                              Rp {(Number(pkg.price_per_day) * pkg.quantity * booking.estimated_duration).toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500">{booking.estimated_duration} hari</p>
                          </div>
                        </div>
                        
                        {/* ✅ ITEMS DALAM PAKET */}
                        {pkg.items && pkg.items.length > 0 && (
                          <div className="p-4 bg-white">
                            <p className="text-sm font-semibold text-gray-700 mb-2">📦 Termasuk:</p>
                            <ul className="space-y-1">
                              {pkg.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                  <span className="font-semibold text-orange-600">{item.quantity}x</span>
                                  <span>{item.item_name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOTAL BIAYA */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-semibold text-gray-900">Total Estimasi Biaya</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      Rp {Number(booking.total_estimated_cost).toLocaleString('id-ID')}
                    </p>
                    {booking.compensation_fee > 0 && (
                      <p className="text-sm text-red-600">
                        + Kompensasi: Rp {Number(booking.compensation_fee).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CATATAN */}
              {booking.notes && (
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <FileText className="h-4 w-4" />
                    Catatan
                  </label>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-900">{booking.notes}</p>
                  </div>
                </div>
              )}

              {/* WAKTU DIBUAT */}
              <div className="text-sm text-gray-600">
                <p>Dibuat pada: {new Date(booking.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default BookingDetail;




// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { 
//   ArrowLeft,
//   User,
//   Phone,
//   Mail,
//   CreditCard,
//   Calendar,
//   Package,
//   DollarSign,
//   FileText,
//   Clock,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
//   MapPin
// } from "lucide-react";

// const BookingDetail = () => {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBookingDetail();
//   }, [bookingId]);

//   const fetchBookingDetail = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`http://localhost/PBL-KELANA-OUTDOOR/api/admin/booking_detail.php?booking_id=${bookingId}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setBooking(data.data);
//       } else {
//         alert('Gagal memuat detail booking');
//         navigate('/admin/bookings');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error saat memuat data');
//       navigate('/admin/bookings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'pending': return 'bg-yellow-500';
//       case 'confirmed': return 'bg-blue-500';
//       case 'active': return 'bg-green-500';
//       case 'completed': return 'bg-gray-500';
//       case 'cancelled': return 'bg-red-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const getPaymentStatusColor = (status) => {
//     switch(status) {
//       case 'unpaid': return 'bg-red-500';
//       case 'partial': return 'bg-yellow-500';
//       case 'paid': return 'bg-green-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const getStatusText = (status) => {
//     switch(status) {
//       case 'pending': return 'Menunggu';
//       case 'confirmed': return 'Dikonfirmasi';
//       case 'active': return 'Berlangsung';
//       case 'completed': return 'Selesai';
//       case 'cancelled': return 'Dibatalkan';
//       default: return status;
//     }
//   };

//   const getPaymentStatusText = (status) => {
//     switch(status) {
//       case 'unpaid': return 'Belum Bayar';
//       case 'partial': return 'DP Paid';
//       case 'paid': return 'Lunas';
//       default: return status;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <RefreshCw className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-500">Memuat detail booking...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!booking) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <p className="text-gray-500">Booking tidak ditemukan</p>
//           <Button onClick={() => navigate('/admin/bookings')} className="mt-4">
//             Kembali ke Daftar Booking
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* HEADER */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 onClick={() => navigate('/admin/bookings')}
//               >
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Kembali
//               </Button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Detail Booking</h1>
//                 <p className="text-gray-600">{booking.booking_code}</p>
//               </div>
//             </div>
            
//             <div className="flex gap-2">
//               <Badge className={`${getStatusColor(booking.status)} text-white`}>
//                 {getStatusText(booking.status)}
//               </Badge>
//               <Badge className={`${getPaymentStatusColor(booking.payment_status)} text-white`}>
//                 {getPaymentStatusText(booking.payment_status)}
//               </Badge>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* INFORMASI PENYEWA */}
//           <Card className="lg:col-span-1">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 Informasi Penyewa
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <label className="text-sm text-gray-600">Nama Lengkap</label>
//                 <p className="font-semibold text-gray-900">{booking.customer_name || '-'}</p>
//               </div>
              
//               {/* ✅ TAMBAHKAN DISPLAY NO. KTP */}
//               {booking.customer_identity_number && (
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-1">
//                     <CreditCard className="h-4 w-4" />
//                     No. KTP/Identitas
//                   </label>
//                   <p className="font-semibold text-gray-900">{booking.customer_identity_number}</p>
//                 </div>
//               )}
              
//               {booking.customer_phone && (
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-1">
//                     <Phone className="h-4 w-4" />
//                     No. Telepon
//                   </label>
//                   <p className="font-semibold text-gray-900">{booking.customer_phone}</p>
//                   <a 
//                     href={`https://wa.me/${booking.customer_phone.replace(/^0/, '62')}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-sm text-green-600 hover:underline"
//                   >
//                     📱 Hubungi via WhatsApp
//                   </a>
//                 </div>
//               )}
              
//               {booking.customer_email && (
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-1">
//                     <Mail className="h-4 w-4" />
//                     Email
//                   </label>
//                   <p className="font-semibold text-gray-900">{booking.customer_email}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* DETAIL BOOKING & EQUIPMENT */}
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Calendar className="h-5 w-5" />
//                 Detail Booking
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
              
//               {/* PERIODE RENTAL */}
//               <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
//                 <div>
//                   <label className="text-sm text-gray-600">Tanggal Mulai</label>
//                   <p className="font-semibold text-gray-900">
//                     {new Date(booking.start_date).toLocaleDateString('id-ID', {
//                       weekday: 'long',
//                       day: 'numeric',
//                       month: 'long',
//                       year: 'numeric'
//                     })}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600">Tanggal Selesai</label>
//                   <p className="font-semibold text-gray-900">
//                     {new Date(booking.end_date).toLocaleDateString('id-ID', {
//                       weekday: 'long',
//                       day: 'numeric',
//                       month: 'long',
//                       year: 'numeric'
//                     })}
//                   </p>
//                 </div>
//                 <div className="col-span-2">
//                   <label className="text-sm text-gray-600 flex items-center gap-1">
//                     <Clock className="h-4 w-4" />
//                     Durasi Sewa
//                   </label>
//                   <p className="font-bold text-xl text-blue-600">
//                     {booking.estimated_duration} Hari
//                   </p>
//                 </div>
//               </div>

//               {/* EQUIPMENT LIST */}
//               <div>
//                 <label className="text-sm text-gray-600 flex items-center gap-1 mb-3">
//                   <Package className="h-4 w-4" />
//                   Peralatan yang Disewa
//                 </label>
//                 <div className="space-y-2">
//                   {booking.items && booking.items.map((item, index) => (
//                     <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-semibold text-gray-900">{item.equipment_name}</p>
//                         <p className="text-sm text-gray-600">
//                           Rp {Number(item.price_per_day).toLocaleString('id-ID')}/hari × {item.quantity} unit
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-bold text-green-600">
//                           Rp {(Number(item.price_per_day) * item.quantity * booking.estimated_duration).toLocaleString('id-ID')}
//                         </p>
//                         <p className="text-xs text-gray-500">{booking.estimated_duration} hari</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* TOTAL BIAYA */}
//               <div className="border-t pt-4">
//                 <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <DollarSign className="h-5 w-5 text-green-600" />
//                     <span className="text-lg font-semibold text-gray-900">Total Estimasi Biaya</span>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-2xl font-bold text-green-600">
//                       Rp {Number(booking.total_estimated_cost).toLocaleString('id-ID')}
//                     </p>
//                     {booking.compensation_fee > 0 && (
//                       <p className="text-sm text-red-600">
//                         + Kompensasi: Rp {Number(booking.compensation_fee).toLocaleString('id-ID')}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* CATATAN */}
//               {booking.notes && (
//                 <div>
//                   <label className="text-sm text-gray-600 flex items-center gap-1 mb-2">
//                     <FileText className="h-4 w-4" />
//                     Catatan
//                   </label>
//                   <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <p className="text-gray-900">{booking.notes}</p>
//                   </div>
//                 </div>
//               )}

//               {/* WAKTU DIBUAT */}
//               <div className="text-sm text-gray-600">
//                 <p>Dibuat pada: {new Date(booking.created_at).toLocaleString('id-ID', {
//                   day: 'numeric',
//                   month: 'long',
//                   year: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 })}</p>
//               </div>
//             </CardContent>
//           </Card>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingDetail;