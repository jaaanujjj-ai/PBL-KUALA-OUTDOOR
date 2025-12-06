import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Package,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react'
import { useContact } from '@/contexts/ContactContext'
import { useToast } from '@/hooks/use-toast'
import { BookingSuccessDialog } from '@/components/BookingSuccessDialog';

const BookingForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { contactInfo } = useContact()
  const { toast } = useToast()

  const { cartItems, totalItems, totalPrice, fromCart } = location.state || {}

  const [bookingData, setBookingData] = useState({
    customerName: '',
    phone: '',
    email: '',
    identityNumber: '',
    rentalStartDate: '',
    rentalEndDate: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    id?: string;
    code?: string;
  }>({});

  // ✅ FETCH PROFILE - AUTO-FILL FORM
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        console.log('⚠️ User belum login')
        setProfileLoading(false)
        return
      }

      try {
        console.log('🔄 Fetching profile for customer_id:', user.id)

        const response = await fetch(
          `http://localhost/PBL-KELANA-OUTDOOR/api/customer/profile.php?id=${user.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('📡 Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('📦 API Response:', data)

        if (data.success && data.data) {
          console.log('✅ Customer data loaded:', data.data)
          
          // ✅ SET DATA KE FORM
          setBookingData(prev => ({
            ...prev,
            customerName: data.data.full_name || '',
            phone: data.data.phone || '',
            email: data.data.email || '',
            identityNumber: data.data.identity_number || ''
          }))

          // ✅ CEK KELENGKAPAN DATA
          const isComplete = data.data.full_name && 
                            data.data.phone && 
                            data.data.email && 
                            data.data.identity_number

          if (isComplete) {
            toast({
              title: '✅ Data Terisi Otomatis',
              description: 'Data penyewa diambil dari profil Anda',
            })
          } else {
            toast({
              title: '⚠️ Profil Belum Lengkap',
              description: 'Silakan lengkapi profil Anda terlebih dahulu',
              variant: 'destructive'
            })
          }
        } else {
          throw new Error(data.message || 'Gagal memuat profil')
        }
      } catch (error: any) {
        console.error('❌ Error fetching profile:', error)
        
        let errorMessage = 'Tidak dapat memuat data profil. Silakan isi manual.'
        
        if (error.message.includes('404')) {
          errorMessage = 'API profile tidak ditemukan. Hubungi admin.'
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Masalah koneksi server. Coba refresh halaman.'
        }
        
        toast({
          title: '⚠️ Peringatan',
          description: errorMessage,
          variant: 'destructive'
        })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, toast])

  // CEK APAKAH ADA DATA CART
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      const confirmRedirect = window.confirm(
        'Keranjang kosong!\n\nKlik OK untuk kembali ke halaman keranjang.'
      )
      if (confirmRedirect) {
        navigate('/cart')
      }
    }
  }, [cartItems, navigate])

  // HITUNG DURASI RENTAL
  const calculateDays = () => {
    if (!bookingData.rentalStartDate || !bookingData.rentalEndDate) return 0
    const start = new Date(bookingData.rentalStartDate)
    const end = new Date(bookingData.rentalEndDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  const rentalDays = calculateDays()
  const grandTotal = totalPrice * rentalDays

  // GENERATE PESAN WHATSAPP
  const generateWhatsAppMessage = () => {
    const itemsList = cartItems
      .map((item: any) => {
        if (item.cart_type === 'package') {
          return `• ${item.package_name} (${item.quantity}x) - Rp ${item.price_per_day.toLocaleString('id-ID')}/hari`
        }
        return `• ${item.equipment.name} (${item.quantity}x) - Rp ${item.equipment.price_per_day.toLocaleString('id-ID')}/hari`
      })
      .join('\n')

    return `
*BOOKING KELANA OUTDOOR*

*DATA PENYEWA:*
• Nama: ${bookingData.customerName}
• HP: ${bookingData.phone}
• Email: ${bookingData.email || '-'}
• No. KTP: ${bookingData.identityNumber || '-'}

*PERALATAN:*
${itemsList}

*PERIODE SEWA:*
• Mulai: ${bookingData.rentalStartDate}
• Selesai: ${bookingData.rentalEndDate}
• Durasi: ${rentalDays} hari

*ESTIMASI BIAYA TOTAL:*
Rp ${grandTotal.toLocaleString('id-ID')}

*CATATAN:*
${bookingData.notes || 'Tidak ada catatan khusus'}

---
Mohon konfirmasi ketersediaan dan detail pembayaran. Terima kasih!
    `.trim()
  }

  // KIRIM VIA WHATSAPP
  const handleWhatsApp = () => {
    if (!bookingData.customerName || !bookingData.phone || !bookingData.rentalStartDate || !bookingData.rentalEndDate) {
      toast({
        title: '⚠️ Data Belum Lengkap',
        description: 'Mohon lengkapi nama, telepon, dan tanggal rental terlebih dahulu!',
        variant: 'destructive'
      })
      return
    }

    const message = generateWhatsAppMessage()
    const phone = contactInfo.phone1.replace(/[^\d]/g, '')
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  // SUBMIT KE API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ✅ VALIDASI DATA
      if (!bookingData.customerName || !bookingData.phone || 
          !bookingData.rentalStartDate || !bookingData.rentalEndDate) {
        toast({
          title: '⚠️ Data Belum Lengkap',
          description: 'Mohon lengkapi semua data yang wajib diisi!',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }

      // ✅ PISAHKAN EQUIPMENT DAN PAKET DARI CART
      const equipmentItems = cartItems
        .filter((item: any) => item.cart_type === 'equipment' && item.equipment)
        .map((item: any) => ({
          equipment_id: item.equipment.equipment_id,
          quantity: item.quantity || 1
        }))

      const packageItems = cartItems
        .filter((item: any) => item.cart_type === 'package' && item.package_id)
        .map((item: any) => ({
          package_id: item.package_id,
          quantity: item.quantity || 1
        }))

      // ✅ DEBUG LOG
      console.log('📦 Cart Items:', cartItems)
      console.log('🔧 Equipment Items:', equipmentItems)
      console.log('📦 Package Items:', packageItems)

      // ✅ VALIDASI ADA ITEM
      if (equipmentItems.length === 0 && packageItems.length === 0) {
        toast({
          title: '⚠️ Keranjang Kosong',
          description: 'Minimal harus ada 1 equipment atau 1 paket',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }

      // ✅ PAYLOAD UNTUK API
      const payload = {
        customer_name: bookingData.customerName,
        customer_phone: bookingData.phone,
        customer_email: bookingData.email || null,
        customer_identity_number: bookingData.identityNumber || null,
        customer_id: user?.id || null,
        start_date: bookingData.rentalStartDate,
        end_date: bookingData.rentalEndDate,
        notes: bookingData.notes || '',
        equipment_items: equipmentItems,
        package_items: packageItems
      }

      console.log('🚀 Payload:', JSON.stringify(payload, null, 2))

      const response = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/public/booking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log('✅ Response:', result)

      if (!result.success) {
        throw new Error(result.message || 'Gagal membuat booking')
      }

      // ✅ GANTI WINDOW.CONFIRM DENGAN INI (LOGIC SAMA, TAMPILAN BEDA)
      setBookingResult({
        id: result.booking_id,
        code: result.booking_code,
      })
      setSuccessDialogOpen(true)
    } catch (error: any) {
      console.error('❌ Booking error:', error)
      toast({
        title: '❌ Gagal Membuat Booking',
        description: error.message || 'Terjadi kesalahan saat memproses booking',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // LOADING STATE
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memproses booking...</p>
        </div>
      </div>
    )
  }

  // KERANJANG KOSONG
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-xl mb-2">Keranjang Booking Kosong</p>
          <p className="text-gray-500 mb-6">Silakan tambah equipment terlebih dahulu</p>
          <Button 
            onClick={() => navigate('/browse')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Package className="h-4 w-4 mr-2" />
            Browse Equipment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cart')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Keranjang
            </Button>
            <h1 className="text-3xl font-bold">Form Booking</h1>
            <p className="text-gray-600">Lengkapi data untuk melanjutkan pemesanan</p>
          </div>

          {/* ✅ INFO ALERT - DATA AUTO-FILL */}
          {user && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">📋 Data Otomatis Terisi</p>
                <p className="text-blue-700">
                  Data <strong>Nama, Telepon, Email, dan No. KTP</strong> diambil dari profil Anda.
                  {!bookingData.customerName && (
                    <span className="block mt-1 text-red-600">
                      ⚠️ Profil Anda belum lengkap. <button onClick={() => navigate('/profile')} className="underline font-semibold">Lengkapi sekarang</button>
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORM */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Penyewa</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                  
                    {/* ✅ NAMA LENGKAP - READONLY */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        value={bookingData.customerName}
                        onChange={(e) => !user && setBookingData({...bookingData, customerName: e.target.value})}
                        placeholder="Masukkan nama lengkap"
                        required
                        readOnly={!!user}
                      />
                      {user && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-green-600">✓</span> Data dari profil Anda
                        </p>
                      )}
                    </div>

                    {/* ✅ NO. TELEPON - READONLY */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        No. Telepon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        value={bookingData.phone}
                        onChange={(e) => !user && setBookingData({...bookingData, phone: e.target.value})}
                        placeholder="08xxxxxxxxxx"
                        required
                        readOnly={!!user}
                      />
                      {user && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-green-600">✓</span> Data dari profil Anda
                        </p>
                      )}
                    </div>

                    {/* ✅ EMAIL - READONLY */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email (Opsional)
                      </label>
                      <input
                        type="email"
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        value={bookingData.email}
                        onChange={(e) => !user && setBookingData({...bookingData, email: e.target.value})}
                        placeholder="email@example.com"
                        readOnly={!!user}
                      />
                      {user && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-green-600">✓</span> Data dari profil Anda
                        </p>
                      )}
                    </div>

                    {/* ✅ NO. KTP - READONLY */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        No. KTP (Opsional)
                      </label>
                      <input
                        type="text"
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        value={bookingData.identityNumber}
                        onChange={(e) => !user && setBookingData({...bookingData, identityNumber: e.target.value})}
                        placeholder="Masukkan nomor KTP"
                        readOnly={!!user}
                      />
                      {user && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-green-600">✓</span> Data dari profil Anda
                        </p>
                      )}
                    </div>
                  
                    {/* ✅ TANGGAL RENTAL - USER INPUT */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Tanggal Mulai <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={bookingData.rentalStartDate}
                          onChange={(e) => setBookingData({...bookingData, rentalStartDate: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Tanggal Selesai <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={bookingData.rentalEndDate}
                          onChange={(e) => setBookingData({...bookingData, rentalEndDate: e.target.value})}
                          min={bookingData.rentalStartDate || new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>
                  
                    {/* ✅ CATATAN - USER INPUT */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        Catatan (Opsional)
                      </label>
                      <textarea
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={4}
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        placeholder="Tambahkan catatan khusus untuk pesanan Anda..."
                      />
                    </div>
                  
                    {/* ✅ SUBMIT BUTTON */}
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                      disabled={loading || !bookingData.customerName || !bookingData.phone}
                    >
                      {loading ? 'Memproses...' : 'Konfirmasi Booking'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* RINGKASAN PESANAN */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Item List */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cartItems.map((item: any) => {
                      const isPackage = item.cart_type === 'package'
                      const name = isPackage ? item.package_name : item.equipment.name
                      const pricePerDay = isPackage ? item.price_per_day : item.equipment.price_per_day
                      const itemTotal = pricePerDay * item.quantity

                      return (
                        <div key={isPackage ? `pkg-${item.package_id}` : `eq-${item.equipment.equipment_id}`} className="flex justify-between border-b pb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{name}</p>
                            <p className="text-xs text-gray-600">
                              {item.quantity}x • Rp {pricePerDay.toLocaleString('id-ID')}/hari
                            </p>
                            {isPackage && (
                              <Badge className="mt-1 bg-orange-100 text-orange-800 text-[10px]">
                                PAKET
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-sm">
                            Rp {itemTotal.toLocaleString('id-ID')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Calculation */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>Rp {totalPrice?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Durasi Sewa</span>
                      <span className="font-semibold">
                        {rentalDays > 0 ? `${rentalDays} hari` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-green-700 pt-2 border-t">
                      <span>Total</span>
                      <span>
                        {rentalDays > 0 ? `Rp ${grandTotal.toLocaleString('id-ID')}` : 'Rp 0'}
                      </span>
                    </div>
                  </div>

                  {/* TOMBOL WHATSAPP */}
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={handleWhatsApp}
                    disabled={!bookingData.customerName || !bookingData.phone || !bookingData.rentalStartDate || !bookingData.rentalEndDate}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Kirim via WhatsApp
                  </Button>

                  {/* Info */}
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 space-y-1">
                    <p className="font-semibold">📞 Admin: {contactInfo.phone1}</p>
                    <p>✅ Gratis pickup & return di lokasi kami</p>
                    <p>⏱️ Konfirmasi via WhatsApp max 1 jam</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Add dialog at the end */}
      <BookingSuccessDialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        bookingId={bookingResult.id}
        bookingCode={bookingResult.code}
        onWhatsAppClick={handleWhatsApp} // ✅ TAMBAHKAN INI
      />
    </>
  )
}

export default BookingForm