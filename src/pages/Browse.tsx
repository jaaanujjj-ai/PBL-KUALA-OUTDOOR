// export default Browse
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Package, ArrowLeft, Weight, Ruler, AlertTriangle, Image as ImageIcon, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { LoginRequiredDialog } from '@/components/LoginRequiredDialog' // ✅ TAMBAHKAN
import { toast } from "sonner"; // ✅ TAMBAHKAN INI DI BAGIAN IMPORT

interface EquipmentImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Equipment {
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
  available_stock: number;
  reserved_stock: number;
  rented_stock: number;
  price_per_day: number;
  condition: string;
  equipment_type?: string;
  image_url?: string;
  images: EquipmentImage[];
  created_at: string;
}

const Browse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<string[]>(['all'])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false) // ✅ TAMBAHKAN

  const { addToCart, isInCart, getCartItem } = useCart()

  useEffect(() => {
    fetchEquipment()
  }, [])

  const getPrimaryImage = (item: Equipment) => {
    if (item.images && item.images.length > 0) {
      const primaryImage = item.images.find(img => img.is_primary) || item.images[0];
      return primaryImage.image_url;
    }
    return item.image_url;
  };

  const buildImageUrl = (item: Equipment) => {
    const imageUrl = getPrimaryImage(item);
    
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `http://localhost/PBL-KELANA-OUTDOOR${imageUrl}`;
    if (imageUrl.startsWith('uploads/')) return `http://localhost/PBL-KELANA-OUTDOOR/${imageUrl}`;
    return `http://localhost/PBL-KELANA-OUTDOOR/uploads/equipment/${imageUrl}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, item: Equipment) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback && fallback.classList.contains('image-fallback')) {
      fallback.style.display = 'flex';
    }
  };

  const handleImageLoad = (item: Equipment) => {
    console.log(`✅ Gambar berhasil dimuat untuk ${item.name}`);
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/public/equipment.php', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const text = await response.text()
      let data;
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }
      
      if (data.error) throw new Error(data.message || 'API returned error')
      
      if (Array.isArray(data) && data.length > 0) {
        setEquipment(data)
        setAllEquipment(data)
        const uniqueCategories = [...new Set(data.map((item: Equipment) => item.category))]
        setCategories(['all', ...uniqueCategories])
      } else if (Array.isArray(data) && data.length === 0) {
        setEquipment([])
        setAllEquipment([])
        setError('Database kosong - belum ada equipment')
      } else {
        throw new Error('Unexpected data format from API')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Database Error: ${errorMessage}`)
      setEquipment([])
      setAllEquipment([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setEquipment(allEquipment)
      return
    }
    const filtered = allEquipment.filter(item =>
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.material?.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    setEquipment(filtered)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    let filtered = allEquipment;
    if (category !== 'all') {
      filtered = allEquipment.filter(item => item.category === category)
    }
    if (searchKeyword.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.code.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }
    setEquipment(filtered)
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setSelectedCategory('all')
    setEquipment(allEquipment)
  }

  // ✅ UPDATE handleAddToCart
  const handleAddToCart = (item: Equipment) => {
    if (!user) {
      setLoginDialogOpen(true) // ✅ BUKA DIALOG CANTIK
      return
    }

    addToCart(item, 1)
    
    // ✅ GANTI ALERT INI:
    // alert(`✅ ${item.name} ditambahkan ke keranjang!\n💰 Rp ${item.price_per_day.toLocaleString('id-ID')}/hari`)
    
    // ✅ DENGAN TOAST INI:
    toast.success(`${item.name} ditambahkan ke keranjang!`, {
      description: `Rp ${item.price_per_day.toLocaleString('id-ID')}/hari`,
      duration: 3000,
    })
  }

  // ✅ TAMBAHKAN FUNGSI INI
  const handleLoginConfirm = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Home
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏕️ Katalog Peralatan Outdoor
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Temukan peralatan berkualitas tinggi untuk petualangan outdoor Anda dari database kami.
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Database Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button 
                  onClick={fetchEquipment} 
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Cari equipment berdasarkan nama, kode, kategori, atau material..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
              {(searchKeyword || selectedCategory !== 'all') && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Reset
                </Button>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Filter Kategori:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => handleCategoryFilter(category)}
                    className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
                    size="sm"
                  >
                    {category === 'all' ? 'Semua Kategori' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-600">
                  {loading ? (
                    "Memuat equipment dari database..."
                  ) : (
                    <>
                      Menampilkan <span className="font-semibold text-green-600">{equipment.length}</span> equipment
                      {allEquipment.length > 0 && equipment.length !== allEquipment.length && (
                        <span className="text-gray-500"> dari total {allEquipment.length}</span>
                      )}
                      {selectedCategory !== 'all' && (
                        <span className="text-green-600"> dalam kategori "{selectedCategory}"</span>
                      )}
                    </>
                  )}
                </p>
                {!loading && allEquipment.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Database: kuala_outdoor | Total categories: {categories.length - 1}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Memuat equipment dari database kuala_outdoor...</p>
            <p className="text-gray-500 text-sm mt-2">Connecting to MySQL database...</p>
          </div>
        ) : error && equipment.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 text-lg mb-2">Gagal memuat data dari database</p>
            <p className="text-gray-600 text-sm mb-4">Periksa koneksi database dan pastikan tabel equipment ada</p>
            <div className="space-y-2">
              <Button onClick={fetchEquipment} className="bg-green-600 hover:bg-green-700">
                Coba Lagi
              </Button>
              <p className="text-xs text-gray-500">
                Database: kuala_outdoor | Table: equipment
              </p>
            </div>
          </div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada equipment ditemukan</p>
            <p className="text-gray-400 text-sm mb-4">
              {searchKeyword || selectedCategory !== 'all' ? 'Coba ubah filter pencarian' : 'Database masih kosong'}
            </p>
            <Button onClick={handleClearSearch} variant="outline">
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipment.map((item) => {
              const imageUrl = buildImageUrl(item);
              const hasImages = item.images && item.images.length > 0;
              
              return (
                <Card key={item.equipment_id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative overflow-hidden">
                    {imageUrl ? (
                      <>
                        <img 
                          key={`browse-img-${item.equipment_id}`}
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => handleImageError(e, item)}
                          onLoad={() => handleImageLoad(item)}
                          style={{ display: 'block' }}
                        />
                        <div className="image-fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-red-400 to-red-600">
                          <div className="text-center text-white p-4">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-70" />
                            <p className="text-sm opacity-70 mb-1">Gambar tidak dapat dimuat</p>
                            <p className="text-xs opacity-50">{item.code}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-white">
                        <span className="text-4xl font-bold mb-2 block">{item.name.charAt(0)}</span>
                        <p className="text-sm opacity-70">Belum ada gambar</p>
                        <p className="text-xs opacity-50 mt-1">{item.code}</p>
                      </div>
                    )}
                    
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                      item.stock_quantity > 5 ? 'bg-green-500 text-white' :
                      item.stock_quantity > 0 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {item.stock_quantity > 0 ? `${item.stock_quantity} unit` : 'Habis'}
                    </div>
                    
                    {hasImages && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        📷 {item.images.length} gambar
                      </div>
                    )}
                    
                    <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      item.condition === 'baik' ? 'bg-green-600 text-white' :
                      item.condition === 'rusak_ringan' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {item.condition}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        {item.category.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{item.code}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {item.name}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      {item.size_capacity && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="h-3 w-3 text-gray-500" />
                          <span className="truncate">Jumlah: {item.size_capacity}</span>
                        </div>
                      )}
                      {item.dimensions && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Ruler className="h-3 w-3 text-gray-500" />
                          <span className="truncate">{item.dimensions}</span>
                        </div>
                      )}
                      {item.weight && item.weight > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Weight className="h-3 w-3 text-gray-500" />
                          <span>Berat: {item.weight} kg</span>
                        </div>
                      )}
                      {item.material && (
                        <div className="text-sm text-gray-600 truncate">
                          <span className="font-medium">Material:</span> {item.material}
                        </div>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          Rp {item.price_per_day.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">per hari</p>
                      </div>
                    </div>
                    
                    <Link to={`/equipment/${item.equipment_id}`}>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 group-hover:bg-green-700 transition-colors mb-2"
                        disabled={item.stock_quantity === 0}
                      >
                        {item.stock_quantity === 0 ? (
                          <>
                            <Package className="h-4 w-4 mr-2" />
                            Stok Habis
                          </>
                        ) : (
                          'Lihat Detail & Sewa'
                        )}
                      </Button>
                    </Link>
                    
                    {/* ✅ TOMBOL ADD TO CART DENGAN VALIDASI LOGIN */}
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      disabled={item.stock_quantity === 0 || isInCart(item.equipment_id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isInCart(item.equipment_id)
                        ? `Sudah di Keranjang (${getCartItem(item.equipment_id)?.quantity || 1})`
                        : 'Tambah ke Keranjang'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {!loading && !error && equipment.length > 0 && (
          <div className="mt-12 text-center text-sm text-gray-500 border-t pt-8">
            <p className="mb-2">Data equipment dimuat langsung dari database MySQL</p>
            <p className="mb-1">Last updated: {new Date().toLocaleString('id-ID')}</p>
            <p className="text-xs">
              Database: <span className="font-mono">kuala_outdoor</span> | 
              Images: <span className="font-mono">uploads/equipment/</span>
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Stok Banyak (5+)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Stok Terbatas (1-5)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Stok Habis
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ TAMBAHKAN DIALOG SEBELUM </div> TERAKHIR */}
      <LoginRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onConfirm={handleLoginConfirm}
      />
    </div>
  )
}

export default Browse
