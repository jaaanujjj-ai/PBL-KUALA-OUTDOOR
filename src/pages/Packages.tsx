import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { 
  Users, 
  Tent, 
  Shield, 
  Check, 
  ShoppingCart,
  ArrowLeft,
  MessageCircle,
  CheckCircle
} from 'lucide-react'
// ✅ TAMBAHKAN IMPORT INI
import { API_BASE_URL } from '@/services/api'

interface PackageItem {
  name: string
  quantity: number
}

interface Package {
  id: number
  name: string
  capacity: string
  price: number
  pricePerDay: string
  badge?: string
  badgeColor?: string
  popular?: boolean
  description?: string
  image_url?: string
  total_items?: number
  package_stock?: number
  package_stock_reserved?: number
  available_stock?: number
  in_stock: boolean
  items: PackageItem[]
}

const Packages = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  // FETCH PACKAGES DARI API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching from:', `${API_BASE_URL}/public/packages.php`); // ✅ DEBUG
        
        const response = await fetch(`${API_BASE_URL}/public/packages.php`);
        const data = await response.json();
        
        console.log('📦 API Response:', data); // ✅ DEBUG
        
        if (data.success) {
          setPackages(data.data);
          console.log('✅ Packages loaded:', data.data.length); // ✅ DEBUG
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        console.error("❌ Error fetching packages:", error);
        toast({
          title: "Error",
          description: "Gagal memuat paket: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPackages()
  }, [toast])

  // ADD TO CART
  const handleAddToCart = async (pkg: Package) => {
    if (!user) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan login terlebih dahulu untuk booking paket',
        variant: 'destructive'
      })
      navigate('/auth', { state: { from: '/packages' } })
      return
    }

    if (!pkg.in_stock) {
      toast({
        title: 'Stock Habis',
        description: 'Maaf, paket ini sedang tidak tersedia',
        variant: 'destructive'
      })
      return
    }

    try {
      setAddingToCart(pkg.id)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 1)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 3)

      const rental_days = 3
      const total_price = pkg.price * rental_days

      const response = await fetch(
        'http://localhost/PBL-KELANA-OUTDOOR/api/customer/package-cart.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: Number(user.id),
            package_id: pkg.id,
            package_name: pkg.name,
            capacity: pkg.capacity,
            quantity: 1,
            rental_start_date: startDate.toISOString().split('T')[0],
            rental_end_date: endDate.toISOString().split('T')[0],
            rental_days,
            price_per_day: pkg.price,
            total_price
          })
        }
      )

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Sukses!',
          description: `${pkg.name} ditambahkan ke keranjang. Mengarahkan...`,
        })
        setTimeout(() => navigate('/cart'), 1000)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menambahkan ke keranjang',
        variant: 'destructive'
      })
    } finally {
      setAddingToCart(null)
    }
  }

  // WHATSAPP BOOKING
  const handleWhatsAppBooking = (pkg: Package) => {
    const message = `Halo! Saya tertarik dengan *${pkg.name}*\n\nHarga: Rp ${pkg.price.toLocaleString()} / hari\nKapasitas: ${pkg.capacity}\n\nMohon info ketersediaan dan booking. Terima kasih!`
    const url = `https://wa.me/6285787553404?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat paket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* BACK BUTTON */}
        <Link to="/">
          <Button variant="ghost" className="mb-6 hover:bg-white/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Home
          </Button>
        </Link>

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600 mb-4">
            Paket Rental Outdoor
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Pilih paket lengkap untuk petualangan Anda dengan harga spesial dan kemudahan booking!
          </p>
        </div>

        {/* PACKAGES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                pkg.popular ? 'border-2 border-orange-400 shadow-lg' : 'border border-gray-200'
              }`}
            >
              {/* BADGE */}
              {pkg.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className={`${pkg.badgeColor} text-white px-3 py-1 text-xs font-bold`}>
                    {pkg.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 pb-6">
                <CardTitle className="text-2xl font-bold text-amber-900 mb-2">
                  {pkg.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-amber-700">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{pkg.capacity}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6 pb-6">
                {/* PRICE & STOCK */}
                <div className="mb-6 text-center">
                  <p className="text-4xl font-bold text-orange-600">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">per hari</p>

                  <div className="mt-3">
                    {pkg.in_stock ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Tersedia ({pkg.available_stock} paket)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                        Stock Habis
                      </span>
                    )}
                  </div>
                </div>

                {/* ITEMS LIST */}
                <div className="mb-6">
                  <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tent className="h-5 w-5 text-orange-600" />
                    Termasuk:
                  </p>
                  <ul className="space-y-2">
                    {pkg.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 font-bold mt-0.5">{item.quantity}</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleAddToCart(pkg)}
                    disabled={!pkg.in_stock || addingToCart === pkg.id}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50"
                  >
                    {addingToCart === pkg.id ? (
                      <>
                        <span className="animate-spin mr-2">Loading...</span>
                        Menambahkan...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Tambah ke Keranjang
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleWhatsAppBooking(pkg)}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 font-medium"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Tanya via WhatsApp
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-3">
                  {pkg.in_stock ? 'Bisa langsung dipesan' : 'Hubungi admin untuk info ketersediaan'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* INFO SECTION */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-orange-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Kenapa Pilih Paket Kami?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center p-4">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Equipment Berkualitas</h4>
                  <p className="text-gray-600 text-sm">Semua peralatan dalam kondisi prima dan terawat</p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Mudah</h4>
                  <p className="text-gray-600 text-sm">Tambah ke keranjang atau chat langsung via WhatsApp</p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fleksibel</h4>
                  <p className="text-gray-600 text-sm">Pilih paket sesuai jumlah orang dan durasi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

export default Packages