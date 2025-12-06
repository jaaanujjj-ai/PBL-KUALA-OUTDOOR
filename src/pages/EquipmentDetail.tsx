import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart, type Equipment } from '@/contexts/CartContext' // ✅ IMPORT TYPE DARI CARTCONTEXT
import { useContact } from '@/contexts/ContactContext' // ✅ IMPORT CONTEXT UNTUK WHATSAPP
import { Footer } from '@/components/Footer'
import { 
  ArrowLeft, Package, Weight, Ruler, CheckCircle, AlertCircle, 
  ShoppingCart, Star, BookOpen, Shield,
  ChevronLeft, ChevronRight, ImageIcon, Loader2,
  MessageCircle // ✅ IMPORT UNTUK WHATSAPP
} from 'lucide-react'
import { LoginRequiredDialog } from '@/components/LoginRequiredDialog' // ✅ TAMBAHKAN
import { toast } from "sonner"; // ✅ TAMBAHKAN INI DI BAGIAN IMPORT

// ✅ INTERFACE IMAGE
interface EquipmentImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

// ✅ INTERFACE USAGE GUIDE
interface UsageGuideStep {
  guide_id?: number;
  step_number: number;
  title: string;
  description: string;
}

// ✅ INTERFACE RENTAL TERMS
interface RentalTerm {
  term_id?: number;
  category: string;
  term_text: string;
  display_order: number;
}

// ✅ EXTEND Equipment TYPE
interface EquipmentWithGuides extends Equipment {
  usage_guide?: UsageGuideStep[];
  rental_terms?: RentalTerm[];
}

const EquipmentDetailV2 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart(); // ✅ GUNAKAN useCart
  const { contactInfo } = useContact(); // ✅ GUNAKAN CONTEXT UNTUK WHATSAPP
  
  const [activeTab, setActiveTab] = useState('detail')
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const [equipment, setEquipment] = useState<EquipmentWithGuides | null>(null) // ✅ GUNAKAN TYPE YANG SUDAH EXTEND
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false) // ✅ TAMBAHKAN STATE

  useEffect(() => {
    if (id) {
      fetchEquipmentDetail(parseInt(id))
    }
  }, [id])

  const fetchEquipmentDetail = async (equipmentId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching equipment detail for ID:', equipmentId)
      
      const response = await fetch(`http://localhost/PBL-KELANA-OUTDOOR/api/public/equipment.php?id=${equipmentId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📥 Equipment detail response:', data)
      
      if (data.error) {
        throw new Error(data.message || 'Equipment tidak ditemukan')
      }

      if (data.equipment_id) {
        // ✅ TRANSFORM DATA UNTUK MATCH DENGAN INTERFACE CARTCONTEXT
        const transformedEquipment: EquipmentWithGuides = {
          equipment_id: data.equipment_id,
          name: data.name,
          code: data.code,
          description: data.description,
          category: data.category,
          size_capacity: data.size_capacity,
          dimensions: data.dimensions,
          weight: data.weight,
          material: data.material,
          stock_quantity: data.stock_quantity,
          price_per_day: data.price_per_day,
          condition: data.condition,
          equipment_type: data.equipment_type || data.category, // ✅ DEFAULT KE CATEGORY JIKA TIDAK ADA
          image_url: data.image_url || data.primary_image || (data.images && data.images[0]?.image_url), // ✅ GUNAKAN IMAGE YANG TERSEDIA
          created_at: data.created_at || new Date().toISOString(),
          available_stock: data.available_stock || data.stock_quantity,
          reserved_stock: data.reserved_stock || 0,
          rented_stock: data.rented_stock || 0,
          images: data.images || [],
          usage_guide: data.usage_guide || [], // ✅ TAMBAH INI
          rental_terms: data.rental_terms || [] // ✅ TAMBAH INI
        }
        
        setEquipment(transformedEquipment)
        console.log('✅ Equipment loaded:', data.name)
        console.log('📖 Usage Guide:', data.usage_guide)
        console.log('📜 Rental Terms:', data.rental_terms)
      } else if (Array.isArray(data) && data.length > 0) {
        const foundEquipment = data.find((item: any) => item.equipment_id === equipmentId)
        if (foundEquipment) {
          const transformedEquipment: EquipmentWithGuides = {
            equipment_id: foundEquipment.equipment_id,
            name: foundEquipment.name,
            code: foundEquipment.code,
            description: foundEquipment.description,
            category: foundEquipment.category,
            size_capacity: foundEquipment.size_capacity,
            dimensions: foundEquipment.dimensions,
            weight: foundEquipment.weight,
            material: foundEquipment.material,
            stock_quantity: foundEquipment.stock_quantity,
            price_per_day: foundEquipment.price_per_day,
            condition: foundEquipment.condition,
            equipment_type: foundEquipment.equipment_type || foundEquipment.category,
            image_url: foundEquipment.image_url || foundEquipment.primary_image || (foundEquipment.images && foundEquipment.images[0]?.image_url),
            created_at: foundEquipment.created_at || new Date().toISOString(),
            available_stock: foundEquipment.available_stock || foundEquipment.stock_quantity,
            reserved_stock: foundEquipment.reserved_stock || 0,
            rented_stock: foundEquipment.rented_stock || 0,
            images: foundEquipment.images || [],
            usage_guide: foundEquipment.usage_guide || [], // ✅ TAMBAH INI
            rental_terms: foundEquipment.rental_terms || [] // ✅ TAMBAH INI
          }
          setEquipment(transformedEquipment)
          console.log('✅ Equipment loaded from array:', foundEquipment.name)
          console.log('📖 Usage Guide:', foundEquipment.usage_guide)
          console.log('📜 Rental Terms:', foundEquipment.rental_terms)
        } else {
          throw new Error('Equipment tidak ditemukan')
        }
      } else {
        throw new Error('Equipment tidak ditemukan')
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching equipment:', err)
      setError('Gagal memuat detail equipment: ' + err.message)
      
      // ✅ FALLBACK EQUIPMENT YANG SESUAI DENGAN INTERFACE
      const fallbackEquipment: EquipmentWithGuides = {
        equipment_id: parseInt(id || '1'),
        name: "Tenda Dome 4 Orang Premium",
        code: "TENDA-001",
        description: "Tenda berkualitas tinggi untuk 4 orang dengan fitur tahan air dan mudah dipasang. Cocok untuk camping keluarga atau petualangan outdoor.",
        category: "tenda",
        size_capacity: "4 orang",
        dimensions: "300x200x150 cm",
        weight: 4.5,
        material: "Polyester 190T Waterproof",
        stock_quantity: 5,
        price_per_day: 60000,
        condition: "baik",
        equipment_type: "tenda",
        image_url: 'https://via.placeholder.com/600x400/22c55e/ffffff?text=Tenda+Dome+4+Orang',
        created_at: new Date().toISOString(),
        available_stock: 5,
        reserved_stock: 0,
        rented_stock: 0,
        images: [
          {
            image_id: 1,
            image_url: 'https://via.placeholder.com/600x400/22c55e/ffffff?text=Tenda+Dome+4+Orang',
            is_primary: true,
            display_order: 1
          }
        ],
        usage_guide: [],
        rental_terms: []
      }
      
      setEquipment(fallbackEquipment)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevImage = () => {
    if (!equipment?.images || equipment.images.length === 0) return
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : equipment.images.length - 1
    )
  }

  const handleNextImage = () => {
    if (!equipment?.images || equipment.images.length === 0) return
    setCurrentImageIndex((prev) => 
      prev < equipment.images.length - 1 ? prev + 1 : 0
    )
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  // ✅ PERBAIKI: GUNAKAN useCart UNTUK ADD TO CART
  const handleAddToCart = async () => {
    if (!equipment) return

    console.log('🎯 Starting add to cart process...')
    
    if (!user) {
      console.log('❌ User not logged in')
      setLoginDialogOpen(true)
      return
    }

    try {
      console.log('👤 User:', user.id)
      console.log('📦 Equipment:', equipment.equipment_id)
      console.log('🔢 Quantity:', quantity)
      
      await addToCart(equipment, quantity)
      
      // ✅ GANTI ALERT INI:
      // alert(`✅ ${equipment.name} (${quantity}x) berhasil ditambahkan ke keranjang!`)
      
      // ✅ DENGAN TOAST INI:
      toast.success(`${equipment.name} ditambahkan ke keranjang!`, {
        description: `${quantity}x • Rp ${(equipment.price_per_day * quantity).toLocaleString('id-ID')}`,
        duration: 3000,
      })
      
      setQuantity(1)
      
    } catch (error: any) {
      console.error('❌ Add to cart error:', error)
      
      // ✅ GANTI ALERT ERROR INI:
      // alert(`❌ Gagal: ${error.message}`)
      
      // ✅ DENGAN TOAST ERROR INI:
      toast.error('Gagal menambahkan ke keranjang', {
        description: error.message,
        duration: 4000,
      })
    }
  }

  // ✅ TAMBAHKAN FUNGSI WHATSAPP
  const handleWhatsApp = () => {
    if (!equipment) return

    const message = `Halo Kuala Outdoor! Saya tertarik dengan ${equipment.name} (${equipment.code}). Bisa info lebih lanjut?`
    const whatsappUrl = `https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleLoginConfirm = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    navigate('/auth')
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail equipment...</p>
        </div>
      </div>
    )
  }

  if (error && !equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Equipment Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/browse')}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Equipment Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-4">Data equipment tidak tersedia</p>
            <Button 
              onClick={() => navigate('/browse')}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayImages = equipment.images && equipment.images.length > 0 
    ? equipment.images.sort((a, b) => a.display_order - b.display_order)
    : []
  
  const hasImages = displayImages.length > 0
  const currentImage = hasImages ? displayImages[currentImageIndex] : null

  const mockRating = 4.8
  const mockTotalReviews = 127
  const mockTotalRentals = 450

  const reviews = [
    {
      id: 1,
      user: "Budi Santoso",
      rating: 5,
      date: "2 minggu lalu",
      comment: "Tenda sangat bagus! Waterproof beneran, kemarin kehujanan tetap kering. Pemasangannya juga mudah, cuma 10 menit udah jadi."
    }
  ]

  // ✅ GUNAKAN DATA DARI API (bukan hardcoded)
  const usageGuide = equipment?.usage_guide || []
  const terms = equipment?.rental_terms || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <button 
            onClick={() => navigate('/browse')}
            className="hover:text-green-600 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse
          </button>
          <span>/</span>
          <span className="capitalize">{equipment.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-md">{equipment.name}</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ {error} - Menampilkan data fallback untuk testing
            </p>
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            🔍 Debug Info: {displayImages.length} gambar tersedia
            {hasImages && currentImage && (
              <span className="ml-2">• URL: {currentImage.image_url}</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT - Image Gallery */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              <div className="relative bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative">
                  {hasImages && currentImage ? (
                    <>
                      <img
                        key={`main-img-${currentImage.image_id}`}
                        src={currentImage.image_url}
                        alt={`${equipment.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Gambar gagal dimuat:', currentImage.image_url)
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                        onLoad={() => console.log('✅ Gambar berhasil dimuat:', currentImage.image_url)}
                      />
                      
                      <div className="hidden absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 items-center justify-center">
                        <div className="text-center text-white p-4">
                          <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-70" />
                          <p className="text-sm opacity-70">Gambar tidak dapat dimuat</p>
                          <p className="text-xs opacity-50 mt-1">URL: {currentImage.image_url}</p>
                        </div>
                      </div>

                      {currentImage.is_primary && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Gambar Utama
                        </div>
                      )}

                      {displayImages.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          {currentImageIndex + 1} / {displayImages.length}
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                        <Badge className="bg-green-500 text-white font-bold shadow-lg">
                          {equipment.stock_quantity} Unit
                        </Badge>
                        <Badge className="bg-blue-500 text-white capitalize shadow-lg">
                          {equipment.condition}
                        </Badge>
                      </div>

                      {displayImages.length > 1 && (
                        <>
                          <button 
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                          </button>
                          <button 
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-white">
                      <span className="text-8xl font-bold block mb-4">
                        {equipment.name.charAt(0)}
                      </span>
                      <p className="text-xl opacity-70">Belum ada gambar</p>
                      <p className="text-sm opacity-50 mt-2">{equipment.code}</p>
                      <p className="text-xs opacity-30 mt-4">Total gambar: {displayImages.length}</p>
                    </div>
                  )}
                </div>
              </div>

              {displayImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((img, idx) => (
                    <button
                      key={img.image_id}
                      onClick={() => handleThumbnailClick(idx)}
                      className={`aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-green-600 transition relative ${
                        idx === currentImageIndex ? 'ring-2 ring-green-600' : ''
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'
                        }}
                      />
                      {img.is_primary && (
                        <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] px-1 rounded-br">
                          ★
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <Card className="text-center">
                  <CardContent className="pt-4 pb-4">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-400 fill-yellow-400" />
                    <div className="text-xl font-bold">{mockRating}</div>
                    <div className="text-xs text-gray-500">{mockTotalReviews} Reviews</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-4">
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="text-xl font-bold">{mockTotalRentals}</div>
                    <div className="text-xs text-gray-500">Kali Disewa</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-4">
                    <Package className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-xl font-bold">{equipment.stock_quantity}</div>
                    <div className="text-xs text-gray-500">Stok Ready</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* CENTER - Detail Content */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-2">
                      {equipment.category.toUpperCase()}
                    </Badge>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {equipment.name}
                    </h1>
                    <p className="text-sm text-gray-500">{equipment.code}</p>
                  </div>
                </div>

                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { id: 'detail', label: 'Detail Produk', icon: Package },
                    { id: 'reviews', label: 'Reviews', icon: Star },
                    { id: 'guide', label: 'Cara Pakai', icon: BookOpen },
                    { id: 'terms', label: 'Perjanjian Sewa', icon: Shield }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap text-sm font-medium ${
                          activeTab === tab.id
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </CardHeader>

              <CardContent className="pt-6 max-h-[600px] overflow-y-auto">
                {activeTab === 'detail' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 leading-relaxed">
                        {equipment.description || 'Tidak ada deskripsi untuk equipment ini.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-4">Spesifikasi Teknis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {equipment.size_capacity && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Package className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Kapasitas</p>
                              <p className="text-gray-600 text-sm">{equipment.size_capacity}</p>
                            </div>
                          </div>
                        )}
                        {equipment.dimensions && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Ruler className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Dimensi</p>
                              <p className="text-gray-600 text-sm">{equipment.dimensions}</p>
                            </div>
                          </div>
                        )}
                        {equipment.weight && equipment.weight > 0 && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Weight className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Berat</p>
                              <p className="text-gray-600 text-sm">{equipment.weight} kg</p>
                            </div>
                          </div>
                        )}
                        {equipment.material && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Material</p>
                              <p className="text-gray-600 text-sm">{equipment.material}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-3">Yang Termasuk dalam Sewa:</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-600 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          1x {equipment.name} lengkap dengan rangka
                        </li>
                        <li className="flex items-center gap-2 text-gray-600 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Pasak dan tali-tali pengencang
                        </li>
                        <li className="flex items-center gap-2 text-gray-600 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Tas carrier
                        </li>
                        <li className="flex items-center gap-2 text-gray-600 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Panduan pemasangan
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* ✅ TAB CARA PAKAI - GUNAKAN DATA DARI API */}
                {activeTab === 'guide' && (
                  <div className="space-y-4">
                    {usageGuide.length > 0 ? (
                      usageGuide.map((guide, idx) => (
                        <div key={guide.guide_id || idx} className="border-l-4 border-green-500 pl-4 py-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                              {guide.step_number}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-base mb-2">{guide.title}</h4>
                              <p className="text-gray-600 text-sm leading-relaxed">{guide.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Panduan penggunaan belum tersedia</p>
                        <p className="text-sm text-gray-400 mt-1">Admin belum menambahkan panduan untuk equipment ini</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ TAB REVIEWS */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{review.user}</p>
                            <p className="text-xs text-gray-500">{review.date}</p>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ TAB PERJANJIAN SEWA - GUNAKAN DATA DARI API */}
                {activeTab === 'terms' && (
                  <div className="space-y-6">
                    {terms.length > 0 ? (
                      (() => {
                        // Group terms by category
                        const groupedTerms = terms.reduce((acc: any, term) => {
                          const cat = term.category || 'Umum'
                          if (!acc[cat]) acc[cat] = []
                          acc[cat].push(term)
                          return acc
                        }, {})

                        return Object.entries(groupedTerms).map(([category, items]: [string, any]) => (
                          <div key={category}>
                            <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                              <Shield className="h-5 w-5 text-blue-600" />
                              {category}
                            </h4>
                            <ul className="space-y-2 ml-7">
                              {items.map((term: RentalTerm, idx: number) => (
                                <li key={term.term_id || idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{term.term_text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      })()
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Ketentuan sewa belum tersedia</p>
                        <p className="text-sm text-gray-400 mt-1">Admin belum menambahkan ketentuan untuk equipment ini</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - Cart Sidebar */}
          <div className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Atur Jumlah & Catatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <div className="text-3xl font-bold text-green-600">
                    Rp {equipment.price_per_day.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">per 24 jam</p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-900">
                    Stok Tersedia: <span className="font-bold">{equipment.stock_quantity} unit</span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Jumlah</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(equipment.stock_quantity, parseInt(e.target.value) || 1)))}
                      className="flex-1 text-center border-2 border-gray-300 rounded-lg py-2 font-bold text-lg"
                      min="1"
                      max={equipment.stock_quantity}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(equipment.stock_quantity, quantity + 1))}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium">
                      Rp {(equipment.price_per_day * quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      Rp {(equipment.price_per_day * quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    * Harga belum termasuk biaya tambahan
                  </p>
                </div>

                <div className="space-y-3">
                  {/* ✅ TOMBOL ADD TO CART YANG SUDAH DIPERBAIKI */}
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
                    onClick={handleAddToCart}
                    disabled={equipment.stock_quantity === 0 || cartLoading}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {cartLoading ? 'Menambahkan...' : equipment.stock_quantity === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </Button>
                  
                  {/* ✅ TOMBOL WHATSAPP YANG SUDAH DIPERBAIKI */}
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Hubungi via WhatsApp
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pickup tersedia saat checkout</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Free cancellation 24 jam</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Booking minimal 1 hari</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Konfirmasi via WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Support teknis 12 jam</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ✅ TAMBAHKAN DIALOG SEBELUM <Footer /> */}
      <LoginRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onConfirm={handleLoginConfirm}
      />
      
      <Footer />
    </div>
  )
}

export default EquipmentDetailV2