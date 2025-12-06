import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/contexts/CartContext'
import { useContact } from '@/contexts/ContactContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft, 
  ExternalLink, 
  Image as ImageIcon,
  RefreshCw,
  Package
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Footer } from '@/components/Footer'

interface EquipmentImage {
  image_id: number
  image_url: string
  is_primary: boolean
  display_order: number
}

interface Equipment {
  equipment_id: number
  name: string
  code: string
  category: string
  stock_quantity: number
  price_per_day: number
  condition: string
  image_url?: string
  images?: EquipmentImage[]
  primary_image?: string
}

interface CartItem {
  cart_id: number
  cart_type: 'equipment' | 'package'
  equipment_id?: number
  package_id?: number
  equipment?: Equipment
  package_name?: string
  capacity?: string
  quantity: number
  price_per_day: number
  total_price: number
  rental_start_date?: string
  rental_end_date?: string
  rental_days: number
  is_checked: boolean
}

const CartPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { contactInfo } = useContact()
  const { 
    cartItems: equipmentCartItems, 
    updateQuantity: updateEquipmentQuantity, 
    removeFromCart: removeEquipment, 
    clearCart 
  } = useCart()

  const [allCartItems, setAllCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getPrimaryImage = (equipment?: Equipment): string | null => {
    if (!equipment) return null
    
    if (equipment.primary_image) {
      return equipment.primary_image
    }
    
    if (equipment.images && equipment.images.length > 0) {
      const primaryImage = equipment.images.find(img => img.is_primary === true)
      if (primaryImage) return primaryImage.image_url
      
      return equipment.images[0].image_url
    }
    
    return equipment.image_url || null
  }

  const buildImageUrl = (imageUrl?: string | null): string | null => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http')) return imageUrl
    if (imageUrl.startsWith('/uploads/')) return `http://localhost/PBL-KELANA-OUTDOOR${imageUrl}`
    if (imageUrl.startsWith('uploads/')) return `http://localhost/PBL-KELANA-OUTDOOR/${imageUrl}`
    return `http://localhost/PBL-KELANA-OUTDOOR/uploads/equipment/${imageUrl}`
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    img.style.display = 'none'
    const fallback = img.parentElement?.querySelector('.image-fallback') as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  useEffect(() => {
    const fetchAllCarts = async () => {
      if (!user) {
        console.log('❌ No user logged in')
        setAllCartItems([])
        setLoading(false)
        return
      }

      try {
        console.log('🔄 Fetching cart for customer_id:', user.id)

        const equipmentItems: CartItem[] = equipmentCartItems.map(item => ({
          cart_id: item.equipment.equipment_id,
          cart_type: 'equipment' as const,
          equipment_id: item.equipment.equipment_id,
          equipment: item.equipment,
          quantity: item.quantity,
          price_per_day: item.equipment.price_per_day,
          total_price: item.equipment.price_per_day * item.quantity,
          rental_days: 1,
          is_checked: true
        }))

        const packageResponse = await fetch(
          `http://localhost/PBL-KELANA-OUTDOOR/api/customer/package-cart.php?customer_id=${user.id}`
        )
        const packageData = await packageResponse.json()

        console.log('📦 Equipment cart:', equipmentItems.length, 'items')
        console.log('🎁 Package cart:', packageData)

        const packageItems: CartItem[] = packageData.success 
          ? packageData.data.map((item: any) => ({
              cart_id: item.cart_id,
              cart_type: 'package' as const,
              package_id: item.package_id,
              package_name: item.package_name,
              capacity: item.capacity,
              quantity: item.quantity,
              price_per_day: parseFloat(item.price_per_day),
              total_price: parseFloat(item.total_price),
              rental_start_date: item.rental_start_date,
              rental_end_date: item.rental_end_date,
              rental_days: item.rental_days,
              is_checked: item.is_checked
            }))
          : []

        const combined = [...equipmentItems, ...packageItems].sort((a, b) => {
          if (a.cart_type === 'package' && b.cart_type === 'equipment') return -1
          if (a.cart_type === 'equipment' && b.cart_type === 'package') return 1
          return 0
        })

        console.log('✅ Total cart items:', combined.length)
        setAllCartItems(combined)

      } catch (error: any) {
        console.error('❌ Error fetching cart:', error)
        toast({
          title: '❌ Error',
          description: 'Gagal memuat keranjang',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllCarts()
  }, [user, equipmentCartItems, toast])

  const handleRefreshCart = async () => {
    setIsRefreshing(true)
    try {
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing cart:', error)
      toast({
        title: '❌ Error',
        description: 'Gagal refresh keranjang',
        variant: 'destructive'
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) return

    setUpdating(item.cart_id)

    try {
      if (item.cart_type === 'equipment' && item.equipment_id) {
        await updateEquipmentQuantity(item.equipment_id, newQuantity)
        
        toast({
          title: '✅ Berhasil',
          description: 'Quantity berhasil diupdate'
        })
      } else if (item.cart_type === 'package') {
        const newTotalPrice = item.price_per_day * newQuantity

        const response = await fetch(
          'http://localhost/PBL-KELANA-OUTDOOR/api/customer/package-cart.php',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cart_id: item.cart_id,
              quantity: newQuantity,
              total_price: newTotalPrice
            })
          }
        )

        const data = await response.json()

        if (data.success) {
          setAllCartItems(prev => prev.map(i => 
            i.cart_id === item.cart_id 
              ? { ...i, quantity: newQuantity, total_price: newTotalPrice }
              : i
          ))

          toast({
            title: '✅ Berhasil',
            description: 'Quantity berhasil diupdate'
          })
        } else {
          throw new Error(data.message)
        }
      }
    } catch (error: any) {
      console.error('❌ Update error:', error)
      toast({
        title: '❌ Gagal',
        description: error.message || 'Gagal mengupdate quantity',
        variant: 'destructive'
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (item: CartItem) => {
    try {
      setDeleting(item.cart_id)

      if (item.cart_type === 'package') {
        const response = await fetch(
          `http://localhost/PBL-KELANA-OUTDOOR/api/customer/package-cart.php?cart_id=${item.cart_id}`,
          { method: 'DELETE' }
        )
        const data = await response.json()

        if (data.success) {
          setAllCartItems(prev => prev.filter(i => i.cart_id !== item.cart_id))
          toast({
            title: '✅ Berhasil',
            description: 'Paket berhasil dihapus dari keranjang'
          })
        } else {
          throw new Error(data.message)
        }
      } else {
        if (item.equipment_id) {
          await removeEquipment(item.equipment_id)
          toast({
            title: '✅ Berhasil',
            description: 'Equipment berhasil dihapus dari keranjang'
          })
        }
      }
    } catch (error: any) {
      console.error('❌ Delete error:', error)
      toast({
        title: '❌ Gagal',
        description: error.message || 'Gagal menghapus item',
        variant: 'destructive'
      })
    } finally {
      setDeleting(null)
      setIsDialogOpen(false)
    }
  }

  const handleClearCart = async () => {
    try {
      clearCart()

      for (const item of allCartItems.filter(i => i.cart_type === 'package')) {
        await fetch(
          `http://localhost/PBL-KELANA-OUTDOOR/api/customer/package-cart.php?cart_id=${item.cart_id}`,
          { method: 'DELETE' }
        )
      }

      setAllCartItems([])
      toast({
        title: '✅ Berhasil',
        description: 'Keranjang berhasil dikosongkan'
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: '❌ Gagal',
        description: 'Gagal mengosongkan keranjang',
        variant: 'destructive'
      })
    }
  }

  const getTotalPrice = () => allCartItems.reduce((sum, item) => sum + item.total_price, 0)
  const getTotalItems = () => allCartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    )
  }

  if (allCartItems.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Keranjang Kosong</h2>
              <p className="text-gray-600 mb-4">
                Belum ada peralatan yang ditambahkan ke keranjang
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/browse">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Browse Equipment
                  </Button>
                </Link>
                <Link to="/packages">
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Lihat Paket
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 flex flex-col">
        <div className="container mx-auto px-4 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/">
                <Button variant="ghost" className="gap-2 mr-2">
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
              <Badge variant="secondary" className="ml-4 bg-green-100 text-green-800">
                {getTotalItems()} items
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleRefreshCart}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Memperbarui...' : 'Refresh'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {allCartItems.map((item) => {
                const primaryImageUrl = item.cart_type === 'equipment' 
                  ? getPrimaryImage(item.equipment)
                  : null
                const displayImageUrl = buildImageUrl(primaryImageUrl)

                return (
                  <Card key={`${item.cart_type}-${item.cart_id}`} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {item.cart_type === 'equipment' && displayImageUrl ? (
                            <>
                              <img
                                src={displayImageUrl}
                                alt={item.equipment?.name || 'Equipment'}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                style={{ display: 'block' }}
                              />
                              
                              <div className="image-fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-red-400 to-red-600">
                                <div className="text-center text-white p-2">
                                  <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-70" />
                                  <p className="text-xs opacity-70">Gambar error</p>
                                  <p className="text-[10px] opacity-50 mt-1">{item.equipment?.code}</p>
                                </div>
                              </div>

                              {item.equipment?.images && item.equipment.images.length > 1 && (
                                <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                                  <ImageIcon className="h-2.5 w-2.5" />
                                  <span>{item.equipment.images.length}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center text-gray-400">
                              {item.cart_type === 'package' ? (
                                <>
                                  <Package className="h-8 w-8 mx-auto mb-1" />
                                  <p className="text-xs">Paket</p>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                                  <p className="text-xs">No image</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {item.cart_type === 'package' ? item.package_name : item.equipment?.name}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Rp {item.price_per_day.toLocaleString('id-ID')} / hari
                              </p>
                            </div>

                            <div className="text-right ml-4">
                              <p className="font-bold text-xl text-green-700">
                                Rp {item.total_price.toLocaleString('id-ID')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} × Rp {item.price_per_day.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            {item.cart_type === 'package' ? (
                              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 text-xs">
                                🎁 PAKET
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                {item.equipment?.code}
                              </Badge>
                            )}
                          </div>

                          {item.cart_type === 'equipment' && (
                            <p className="text-xs text-gray-500 mb-3">
                              Stok: {item.equipment?.stock_quantity} | Kondisi: {item.equipment?.condition}
                            </p>
                          )}

                          {item.capacity && (
                            <p className="text-sm text-gray-600 mb-2">
                              👥 Kapasitas: {item.capacity}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === item.cart_id}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <span className="w-8 text-center font-medium">
                              {updating === item.cart_id ? '...' : item.quantity}
                            </span>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              disabled={updating === item.cart_id || (item.cart_type === 'equipment' && item.quantity >= (item.equipment?.stock_quantity || 0))}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setItemToDelete(item)
                                setIsDialogOpen(true)
                              }}
                              disabled={deleting === item.cart_id}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            {item.cart_type === 'equipment' && item.equipment_id && (
                              <Link to={`/equipment/${item.equipment_id}?from=cart`}>
                                <Button variant="outline" size="sm" className="ml-2">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Lihat Detail
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Jumlah Item</span>
                      <span>{getTotalItems()} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-green-700">
                        Rp {getTotalPrice().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      if (allCartItems.length === 0) {
                        toast({
                          title: '⚠️ Keranjang Kosong',
                          description: 'Tambahkan equipment atau paket terlebih dahulu',
                          variant: 'destructive'
                        })
                        return
                      }

                      const cartItemsForBooking = allCartItems.map(item => ({
                        cart_type: item.cart_type,
                        equipment: item.cart_type === 'equipment' ? item.equipment : null,
                        package_id: item.cart_type === 'package' ? item.package_id : null,
                        package_name: item.cart_type === 'package' ? item.package_name : null,
                        quantity: item.quantity,
                        price_per_day: item.price_per_day,
                        total_price: item.total_price
                      }))

                      console.log('📦 Sending cart data to booking form:', cartItemsForBooking)

                      navigate('/booking/form', {
                        state: {
                          cartItems: cartItemsForBooking,
                          totalItems: getTotalItems(),
                          totalPrice: getTotalPrice(),
                          fromCart: true
                        }
                      })
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-base py-3 mb-3"
                    disabled={allCartItems.length === 0}
                  >
                    Lanjut ke Pembayaran
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={allCartItems.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Kosongkan Keranjang
                  </Button>

                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-700 text-center">
                      🎯 Gratis pickup & return di lokasi kami
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-8 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Butuh peralatan lain?</h3>
                    <p className="text-gray-600">Browse koleksi lengkap peralatan outdoor kami</p>
                  </div>
                  <Link to="/browse?from=cart">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Peralatan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="font-semibold text-blue-800 mb-2">
                  🎒 Siap untuk petualangan?
                </h3>
                <p className="text-blue-600 mb-4">
                  Booking seluruh keranjang sekaligus atau hubungi kami langsung
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <div className="sm:border-l sm:border-blue-300 sm:pl-6">
                    <p className="text-sm text-blue-600 mb-2">Atau hubungi langsung</p>
                    <a
                      href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo,%20saya%20tertarik%20dengan%20peralatan%20di%20keranjang%20saya`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-600 hover:bg-green-700">
                        Chat WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Item dari Keranjang?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus{' '}
                <strong>
                  {itemToDelete?.cart_type === 'package' 
                    ? itemToDelete?.package_name 
                    : itemToDelete?.equipment?.name}
                </strong>
                {' '}dari keranjang? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => itemToDelete && handleDelete(itemToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Ya, Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Footer />
    </>
  )
}

export default CartPage