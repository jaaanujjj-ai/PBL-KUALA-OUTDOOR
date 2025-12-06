// // import { useState, useEffect } from 'react'
// // import { useSearchParams, useNavigate, Link } from 'react-router-dom'
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// // import { Button } from '@/components/ui/button'
// // import { Input } from '@/components/ui/input'
// // import { Badge } from '@/components/ui/badge'
// // import { ArrowLeft, Search, Package, Plus, CheckCircle, Image as ImageIcon, AlertTriangle } from 'lucide-react'

// // interface Equipment {
// //   equipment_id: number;
// //   name: string;
// //   code: string;
// //   description?: string;
// //   category: string;
// //   size_capacity?: string;
// //   dimensions?: string;
// //   weight?: number;
// //   material?: string;
// //   stock_quantity: number;
// //   available_stock: number;
// //   reserved_stock: number;
// //   rented_stock: number;
// //   price_per_day: number;
// //   condition: string;
// //   equipment_type?: string;
// //   image_url?: string;
// //   created_at: string;
// // }

// // const TambahEquipment = () => {
// //   const [searchParams] = useSearchParams()
// //   const navigate = useNavigate()
  
// //   const [equipment, setEquipment] = useState<Equipment[]>([])
// //   const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
// //   const [categories, setCategories] = useState<string[]>(['all'])
// //   const [selectedCategory, setSelectedCategory] = useState<string>('all')
// //   const [searchKeyword, setSearchKeyword] = useState<string>('')
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)
  
// //   // ✅ NEW: State untuk track equipment dari localStorage
// //   const [existingBookingItems, setExistingBookingItems] = useState<any[]>([])
// //   const [addedEquipments, setAddedEquipments] = useState<Set<number>>(new Set())

// //   const fromPage = searchParams.get('from') || 'browse'

// //   // ✅ LOAD EXISTING BOOKING ITEMS from localStorage
// //   useEffect(() => {
// //     const savedBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
// //     setExistingBookingItems(savedBookingItems)
    
// //     // Set existing equipment IDs
// //     const existingIds = savedBookingItems.map((item: any) => item.equipment.equipment_id)
// //     setAddedEquipments(new Set(existingIds))
    
// //     console.log('📦 Existing booking items loaded:', savedBookingItems.length, 'items')
// //     console.log('🔗 Existing equipment IDs:', existingIds)
// //   }, [])

// //   useEffect(() => {
// //     fetchEquipment()
// //   }, [existingBookingItems]) // Re-fetch when booking items change

// //   const fetchEquipment = async () => {
// //     try {
// //       setLoading(true)
// //       setError(null)
      
// //       console.log("🔍 Fetching equipment for adding to booking...")
      
// //       const controller = new AbortController()
// //       const timeoutId = setTimeout(() => controller.abort(), 3000)
      
// //       const response = await fetch('http://localhost/PBL - KELANA OUTDOOR/api/public/equipment.php', {
// //         method: 'GET',
// //         headers: {
// //           'Accept': 'application/json',
// //           'Content-Type': 'application/json'
// //         },
// //         signal: controller.signal
// //       })

// //       clearTimeout(timeoutId)
// //       console.log("📡 Response status:", response.status)
      
// //       if (!response.ok) {
// //         throw new Error(`HTTP ${response.status}: ${response.statusText}`)
// //       }

// //       const text = await response.text()
// //       console.log("📄 Raw response preview:", text.substring(0, 300))
      
// //       if (!text || text.trim() === '') {
// //         throw new Error('Empty response from server')
// //       }
      
// //       let data;
// //       try {
// //         data = JSON.parse(text)
// //       } catch (parseError) {
// //         console.error("JSON Parse Error:", parseError)
// //         throw new Error('Invalid JSON response from server')
// //       }

// //       console.log("✅ Parsed data:", data)

// //       if (data.error) {
// //         throw new Error(data.message || 'API returned error')
// //       }

// //       if (Array.isArray(data) && data.length > 0) {
// //         // ✅ SUCCESS: Filter available equipment only
// //         const availableEquipment = data.filter(item => item.stock_quantity > 0)
        
// //         setEquipment(availableEquipment)
// //         setFilteredEquipment(availableEquipment)
        
// //         const uniqueCategories = [...new Set(availableEquipment.map((item: Equipment) => item.category))]
// //         setCategories(['all', ...uniqueCategories])
        
// //         console.log("✅ Available equipment loaded:", availableEquipment.length, "items")
// //         setError(null)
// //         return
        
// //       } else if (Array.isArray(data) && data.length === 0) {
// //         console.warn("⚠️ Database is empty")
// //         setError('Database kosong - belum ada equipment')
// //         setEquipment([])
// //         setFilteredEquipment([])
// //       } else {
// //         throw new Error('Unexpected data format from API')
// //       }

// //     } catch (err) {
// //       console.error('❌ API Error, using fallback data:', err)
      
// //       // ✅ FALLBACK DATA - Different equipment types
// //       const fallbackEquipment: Equipment[] = [
// //         {
// //           equipment_id: 201,
// //           name: "Tenda Dome 4 Orang",
// //           code: "TENDA-001",
// //           description: "Tenda dome berkualitas tinggi untuk camping 4 orang dengan bahan waterproof",
// //           category: "tenda",
// //           size_capacity: "4 orang",
// //           dimensions: "300x200x150 cm",
// //           weight: 4.5,
// //           material: "Polyester ripstop",
// //           stock_quantity: 5,
// //           available_stock: 5,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 75000,
// //           condition: "baik",
// //           equipment_type: "single",
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         },
// //         {
// //           equipment_id: 202,
// //           name: "Sleeping Bag Mountain",
// //           code: "SB-001",
// //           description: "Sleeping bag untuk cuaca dingin pegunungan, tahan suhu hingga -5°C",
// //           category: "sleeping_gear",
// //           size_capacity: "1 orang",
// //           dimensions: "220x80x60 cm",
// //           weight: 2.0,
// //           material: "Down filled",
// //           stock_quantity: 8,
// //           available_stock: 8,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 35000,
// //           condition: "baik",
// //           equipment_type: "single",
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         },
// //         {
// //           equipment_id: 203,
// //           name: "Carrier 60L Adventure",
// //           code: "CARR-001", 
// //           description: "Tas carrier 60 liter untuk hiking dan camping dengan frame internal",
// //           category: "tas",
// //           size_capacity: "60L",
// //           dimensions: "75x35x25 cm",
// //           weight: 1.8,
// //           material: "Cordura nylon",
// //           stock_quantity: 10,
// //           available_stock: 10,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 25000,
// //           condition: "baik",
// //           equipment_type: "single",
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         },
// //         {
// //           equipment_id: 204,
// //           name: "Kompor Portable + Gas",
// //           code: "KOMP-001",
// //           description: "Kompor portable dengan tabung gas untuk memasak outdoor, flame control",
// //           category: "cooking",
// //           size_capacity: "Portable",
// //           dimensions: "15x15x10 cm",
// //           weight: 0.8,
// //           material: "Stainless steel",
// //           stock_quantity: 6,
// //           available_stock: 6,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 15000,
// //           condition: "baik",
// //           equipment_type: "single", 
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         },
// //         {
// //           equipment_id: 205,
// //           name: "Headlamp LED Rechargeable",
// //           code: "LAMP-001",
// //           description: "Senter kepala LED dengan baterai rechargeable, beam distance 50m",
// //           category: "lighting",
// //           size_capacity: "Personal",
// //           dimensions: "8x6x4 cm",
// //           weight: 0.2,
// //           material: "ABS plastic",
// //           stock_quantity: 15,
// //           available_stock: 15,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 10000,
// //           condition: "baik",
// //           equipment_type: "single",
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         },
// //         {
// //           equipment_id: 206,
// //           name: "Matras Camping Foam",
// //           code: "MAT-001",
// //           description: "Matras foam untuk kenyamanan tidur camping, anti air dan ringan",
// //           category: "sleeping_gear",
// //           size_capacity: "1 orang",
// //           dimensions: "180x60x2 cm",
// //           weight: 0.6,
// //           material: "EVA foam",
// //           stock_quantity: 12,
// //           available_stock: 12,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 8000,
// //           condition: "baik",
// //           equipment_type: "single",
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         },
// //         {
// //           equipment_id: 207,
// //           name: "Jaket Windbreaker",
// //           code: "JAK-001",
// //           description: "Jaket anti angin dan air untuk aktivitas outdoor, breathable material",
// //           category: "clothing",
// //           size_capacity: "L",
// //           dimensions: "Fit to body",
// //           weight: 0.4,
// //           material: "Polyester membrane",
// //           stock_quantity: 7,
// //           available_stock: 7,
// //           reserved_stock: 0,
// //           rented_stock: 0,
// //           price_per_day: 20000,
// //           condition: "baik",
// //           equipment_type: "single",
// //           image_url: null,
// //           created_at: new Date().toISOString()
// //         }
// //       ]
      
// //       setEquipment(fallbackEquipment)
// //       setFilteredEquipment(fallbackEquipment)
      
// //       const uniqueCategories = [...new Set(fallbackEquipment.map(item => item.category))]
// //       setCategories(['all', ...uniqueCategories])
      
// //       console.log("✅ Fallback equipment loaded:", fallbackEquipment.length, "items")
      
// //       // User-friendly error message
// //       const errorMessage = err instanceof Error ? err.message : 'Unknown error'
// //       if (err.name === 'AbortError') {
// //         setError('⏱️ Koneksi database timeout. Menggunakan data demo.')
// //       } else if (errorMessage.includes('HTTP 404')) {
// //         setError('🔌 API endpoint tidak ditemukan. Menggunakan data demo.')
// //       } else if (errorMessage.includes('Failed to fetch')) {
// //         setError('🌐 Tidak dapat terhubung ke server. Menggunakan data demo.')
// //       } else {
// //         setError(`🔧 ${errorMessage}. Menggunakan data demo.`)
// //       }
      
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // ✅ NEW: localStorage-based handleAddEquipment
// //   const handleAddEquipment = async (equipment: Equipment) => {
// //     try {
// //       console.log('🛒 Adding equipment to localStorage booking:', equipment.name)
      
// //       // ✅ UPDATE button state immediately
// //       setAddedEquipments(prev => new Set([...prev, equipment.equipment_id]))
      
// //       // ✅ GET existing booking items from localStorage
// //       const existingBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
      
// //       // ✅ CHECK if equipment already exists
// //       const existingIndex = existingBookingItems.findIndex(
// //         (item: any) => item.equipment.equipment_id === equipment.equipment_id
// //       )

// //       let updatedBookingItems
// //       if (existingIndex >= 0) {
// //         // ✅ INCREASE QUANTITY if already exists
// //         updatedBookingItems = existingBookingItems.map((item: any, index: number) => 
// //           index === existingIndex 
// //             ? { ...item, quantity: Math.min(item.quantity + 1, equipment.stock_quantity) }
// //             : item
// //         )
// //         alert(`✅ Quantity ${equipment.name} ditambah 1`)
// //       } else {
// //         // ✅ ADD NEW EQUIPMENT
// //         updatedBookingItems = [...existingBookingItems, {
// //           equipment: equipment,
// //           quantity: 1
// //         }]
// //         alert(`✅ ${equipment.name} berhasil ditambahkan ke booking!`)
// //       }
      
// //       // ✅ SAVE to localStorage
// //       localStorage.setItem('bookingItems', JSON.stringify(updatedBookingItems))
// //       console.log('💾 Updated booking items saved:', updatedBookingItems.length, 'items')
      
// //       // ✅ UPDATE local state
// //       setExistingBookingItems(updatedBookingItems)
      
// //       // ✅ REDIRECT back to booking form (no URL parameters needed)
// //       setTimeout(() => {
// //         console.log('🔄 Redirecting back to booking form')
// //         navigate('/booking/form')
// //       }, 1000) // Delay untuk user feedback
      
// //     } catch (error) {
// //       console.error('❌ Error adding equipment:', error)
// //       // Reset button state jika error
// //       setAddedEquipments(prev => {
// //         const newSet = new Set(prev)
// //         newSet.delete(equipment.equipment_id)
// //         return newSet
// //       })
// //       alert('❌ Gagal menambahkan equipment')
// //     }
// //   }

// //   // Filter equipments
// //   useEffect(() => {
// //     let filtered = equipment;
    
// //     if (searchKeyword) {
// //       filtered = filtered.filter(item => 
// //         item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
// //         item.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
// //         item.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
// //         item.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
// //         item.material?.toLowerCase().includes(searchKeyword.toLowerCase())
// //       );
// //     }
    
// //     if (selectedCategory !== "all") {
// //       filtered = filtered.filter(item => item.category === selectedCategory);
// //     }
    
// //     setFilteredEquipment(filtered);
// //   }, [equipment, searchKeyword, selectedCategory])

// //   const handleSearch = () => {
// //     console.log(`🔍 Search results: ${filteredEquipment.length} items found`)
// //   }

// //   const handleCategoryFilter = (category: string) => {
// //     console.log("🏷️ Filter category:", category)
// //     setSelectedCategory(category)
// //   }

// //   const handleClearSearch = () => {
// //     setSearchKeyword('')
// //     setSelectedCategory('all')
// //   }

// //   // ✅ SIMPLE BACK URL - always to booking form
// //   const getBackUrl = () => {
// //     return '/booking/form'
// //   }

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Memuat daftar equipment...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Back Button */}
// //       <div className="container mx-auto px-4 pt-6">
// //         <Link to={getBackUrl()}>
// //           <Button variant="ghost" className="mb-4">
// //             <ArrowLeft className="h-4 w-4 mr-2" />
// //             Kembali ke Booking Form
// //           </Button>
// //         </Link>
// //       </div>

// //       {/* Header */}
// //       <div className="bg-white shadow-sm border-b">
// //         <div className="container mx-auto px-4 py-8">
// //           <div className="text-center">
// //             <h1 className="text-4xl font-bold text-gray-900 mb-4">
// //               ➕ Tambah Equipment ke Booking
// //             </h1>
// //             <p className="text-gray-600 text-lg max-w-2xl mx-auto">
// //               Pilih equipment tambahan untuk ditambahkan ke booking Anda.
// //             </p>
            
// //             {/* ✅ INFO: Current booking items */}
// //             {existingBookingItems.length > 0 && (
// //               <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg max-w-lg mx-auto">
// //                 <p className="text-blue-800 text-sm">
// //                   📋 <strong>{existingBookingItems.length} equipment</strong> sudah ada di booking Anda
// //                 </p>
// //                 <div className="text-xs text-blue-600 mt-1">
// //                   {existingBookingItems.map((item: any) => item.equipment.name).join(', ')}
// //                 </div>
// //               </div>
// //             )}
            
// //             {/* Error Warning */}
// //             {error && (
// //               <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg max-w-lg mx-auto">
// //                 <div className="flex items-center gap-2 text-red-800">
// //                   <AlertTriangle className="h-4 w-4" />
// //                   <span className="font-medium">Database Error</span>
// //                 </div>
// //                 <p className="text-red-700 text-sm mt-1">{error}</p>
// //                 <Button 
// //                   onClick={fetchEquipment} 
// //                   className="mt-2 bg-red-600 hover:bg-red-700"
// //                   size="sm"
// //                 >
// //                   Coba Lagi
// //                 </Button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       <div className="container mx-auto px-4 py-8">
// //         {/* Search & Filter - same as before */}
// //         <Card className="mb-8">
// //           <CardContent className="pt-6">
// //             {/* Search Bar */}
// //             <div className="flex gap-4 mb-4">
// //               <div className="flex-1 relative">
// //                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
// //                 <Input
// //                   type="text"
// //                   placeholder="Cari equipment berdasarkan nama, kode, kategori..."
// //                   value={searchKeyword}
// //                   onChange={(e) => setSearchKeyword(e.target.value)}
// //                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
// //                   className="pl-10"
// //                 />
// //               </div>
              
// //               <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
// //                 <Search className="h-4 w-4 mr-2" />
// //                 Cari
// //               </Button>
              
// //               {(searchKeyword || selectedCategory !== 'all') && (
// //                 <Button variant="outline" onClick={handleClearSearch}>
// //                   Reset
// //                 </Button>
// //               )}
// //             </div>

// //             {/* Categories */}
// //             <div>
// //               <h3 className="font-semibold text-gray-900 mb-3">Filter Kategori:</h3>
// //               <div className="flex flex-wrap gap-2">
// //                 {categories.map((category) => (
// //                   <Button
// //                     key={category}
// //                     variant={selectedCategory === category ? "default" : "outline"}
// //                     onClick={() => handleCategoryFilter(category)}
// //                     className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
// //                     size="sm"
// //                   >
// //                     {category === 'all' ? 'Semua Kategori' : category.charAt(0).toUpperCase() + category.slice(1)}
// //                   </Button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Stats */}
// //             <div className="mt-4 pt-4 border-t">
// //               <div className="flex justify-between items-center text-sm">
// //                 <p className="text-gray-600">
// //                   Menampilkan <span className="font-semibold text-green-600">{filteredEquipment.length}</span> equipment tersedia
// //                   {equipment.length > 0 && filteredEquipment.length !== equipment.length && (
// //                     <span className="text-gray-500"> dari total {equipment.length}</span>
// //                   )}
// //                   {selectedCategory !== 'all' && (
// //                     <span className="text-green-600"> dalam kategori "{selectedCategory}"</span>
// //                   )}
// //                 </p>
                
// //                 <p className="text-xs text-gray-500">
// //                   Equipment tersedia: {equipment.length} | Di booking: {existingBookingItems.length}
// //                 </p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>

// //         {/* Equipment Grid */}
// //         {error && filteredEquipment.length === 0 ? (
// //           <div className="text-center py-12">
// //             <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
// //             <p className="text-red-600 text-lg mb-2">Gagal memuat data dari database</p>
// //             <p className="text-gray-600 text-sm mb-4">Periksa koneksi database dan pastikan tabel equipment ada</p>
// //             <Button onClick={fetchEquipment} className="bg-green-600 hover:bg-green-700">
// //               Coba Lagi
// //             </Button>
// //           </div>
// //         ) : filteredEquipment.length === 0 ? (
// //           <div className="text-center py-12">
// //             <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //             <p className="text-gray-500 text-lg">Tidak ada equipment ditemukan</p>
// //             <p className="text-gray-400 text-sm mb-4">
// //               {searchKeyword || selectedCategory !== 'all' ? 'Coba ubah filter pencarian' : 'Database masih kosong'}
// //             </p>
// //             <Button onClick={handleClearSearch} variant="outline">
// //               Reset Filter
// //             </Button>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //             {filteredEquipment.map((item) => {
// //               // ✅ CHECK: Is this equipment already in booking?
// //               const isInBooking = existingBookingItems.some(
// //                 (bookingItem: any) => bookingItem.equipment.equipment_id === item.equipment_id
// //               )
// //               const isJustAdded = addedEquipments.has(item.equipment_id)
              
// //               return (
// //                 <Card key={item.equipment_id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
// //                   {/* Equipment Image */}
// //                   <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative">
// //                     {item.image_url ? (
// //                       <>
// //                         <img 
// //                           src={`http://localhost${item.image_url}`}
// //                           alt={item.name}
// //                           className="w-full h-full object-cover"
// //                           onError={(e) => {
// //                             (e.target as HTMLImageElement).style.display = 'none';
// //                             const nextElement = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
// //                             if (nextElement) {
// //                               nextElement.style.display = 'flex';
// //                             }
// //                           }}
// //                         />
// //                         <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
// //                           <div className="text-center text-white">
// //                             <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-70" />
// //                             <p className="text-sm opacity-70">Gambar tidak tersedia</p>
// //                           </div>
// //                         </div>
// //                       </>
// //                     ) : (
// //                       <div className="text-center text-white">
// //                         <span className="text-4xl font-bold">
// //                           {item.name.charAt(0)}
// //                         </span>
// //                         <p className="text-sm mt-2 opacity-70">Belum ada gambar</p>
// //                       </div>
// //                     )}
                    
// //                     {/* Stock indicator */}
// //                     <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
// //                       {item.stock_quantity} unit
// //                     </div>
                    
// //                     {/* Status indicator */}
// //                     {isInBooking && (
// //                       <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
// //                         Di Booking
// //                       </div>
// //                     )}
// //                   </div>
                  
// //                   <CardHeader className="pb-3">
// //                     <div className="flex items-center gap-2 mb-2">
// //                       <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
// //                         {item.category.toUpperCase()}
// //                       </Badge>
// //                       <span className="text-xs text-gray-500">{item.code}</span>
// //                     </div>
// //                     <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
// //                       {item.name}
// //                     </h3>
// //                   </CardHeader>

// //                   <CardContent className="pt-0">
// //                     {/* Specifications */}
// //                     <div className="space-y-1 mb-3">
// //                       {item.size_capacity && (
// //                         <div className="text-sm text-gray-600">
// //                           📦 <span>{item.size_capacity}</span>
// //                         </div>
// //                       )}
                      
// //                       {item.material && (
// //                         <div className="text-sm text-gray-600 truncate">
// //                           🧵 <span>{item.material}</span>
// //                         </div>
// //                       )}
// //                     </div>
                    
// //                     {item.description && (
// //                       <p className="text-gray-600 text-sm mb-4 line-clamp-2">
// //                         {item.description}
// //                       </p>
// //                     )}
                    
// //                     {/* Price */}
// //                     <div className="bg-gray-50 rounded-lg p-3 mb-4">
// //                       <p className="text-xl font-bold text-green-600">
// //                         Rp {item.price_per_day.toLocaleString('id-ID')}
// //                       </p>
// //                       <p className="text-xs text-gray-500">per hari</p>
// //                     </div>
                    
// //                     {/* ✅ DYNAMIC BUTTON based on localStorage status */}
// //                     {isInBooking && !isJustAdded ? (
// //                       <Button 
// //                         onClick={() => handleAddEquipment(item)}
// //                         className="w-full bg-orange-600 hover:bg-orange-700"
// //                       >
// //                         <Plus className="h-4 w-4 mr-2" />
// //                         Tambah Quantity
// //                       </Button>
// //                     ) : isJustAdded ? (
// //                       <Button 
// //                         className="w-full bg-green-500 hover:bg-green-600"
// //                         disabled
// //                       >
// //                         <CheckCircle className="h-4 w-4 mr-2" />
// //                         Berhasil Ditambahkan
// //                       </Button>
// //                     ) : (
// //                       <Button 
// //                         onClick={() => handleAddEquipment(item)}
// //                         className="w-full bg-blue-600 hover:bg-blue-700"
// //                       >
// //                         <Plus className="h-4 w-4 mr-2" />
// //                         Tambah Equipment
// //                       </Button>
// //                     )}
// //                   </CardContent>
// //                 </Card>
// //               )
// //             })}
// //           </div>
// //         )}

// //         {/* Footer info */}
// //         {!loading && !error && filteredEquipment.length > 0 && (
// //           <div className="mt-8 text-center text-sm text-gray-500">
// //             <p>Pilih equipment tambahan untuk melengkapi booking Anda</p>
// //             <div className="flex justify-center gap-4 mt-2">
// //               <Link to={getBackUrl()}>
// //                 <Button variant="outline" size="sm">
// //                   <ArrowLeft className="h-4 w-4 mr-2" />
// //                   Kembali ke Booking
// //                 </Button>
// //               </Link>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// // export default TambahEquipment



// import { useState, useEffect } from 'react'
// import { useSearchParams, Link, useNavigate } from 'react-router-dom'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Badge } from '@/components/ui/badge'
// import { ArrowLeft, MessageCircle, Calendar, Plus, Minus, Trash2, CheckCircle, ShoppingCart, Package } from 'lucide-react'

// interface Equipment {
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
//   available_stock: number;
//   reserved_stock: number;
//   rented_stock: number;
//   price_per_day: number;
//   condition: string;
//   equipment_type?: string;
//   image_url?: string;
//   created_at: string;
// }

// interface BookingItem {
//   equipment: Equipment
//   quantity: number
// }

// const BookingForm = () => {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
  
//   const [bookingItems, setBookingItems] = useState<BookingItem[]>([])
//   const [loading, setLoading] = useState(true)
//   const [initialEquipment, setInitialEquipment] = useState<Equipment | null>(null) // ✅ Store initial equipment
  
//   // Form data
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     identity_number: '',
//     start_date: '',
//     end_date: '',
//     duration: 1,
//     notes: ''
//   })

//   const equipmentId = searchParams.get('equipment_id')

//   // ✅ CLEANUP localStorage saat keluar dari BookingForm - RESET ke initial
//   useEffect(() => {
//     return () => {
//       console.log('🧹 Leaving BookingForm - resetting to initial equipment only')
//       localStorage.removeItem('bookingItems')
      
//       // ✅ RESET to initial equipment for next visit
//       if (initialEquipment) {
//         const resetBookingItems = [{
//           equipment: initialEquipment,
//           quantity: 1
//         }]
//         localStorage.setItem('bookingItems', JSON.stringify(resetBookingItems))
//         console.log('🔄 Reset to initial equipment:', initialEquipment.name)
//       }
//     }
//   }, [initialEquipment])

//   // ✅ MAIN EFFECT: Load booking items
//   useEffect(() => {
//     console.log('🔍 BookingForm mounted - loading booking items...')
//     loadBookingItems()
//   }, [])

//   // ✅ LISTEN for localStorage changes dari TambahEquipment
//   useEffect(() => {
//     const handleStorageChange = () => {
//       console.log('📦 localStorage updated from TambahEquipment')
//       const savedItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
//       if (savedItems.length > 0) {
//         setBookingItems(savedItems)
//       }
//     }

//     window.addEventListener('bookingItemsUpdated', handleStorageChange)
    
//     return () => {
//       window.removeEventListener('bookingItemsUpdated', handleStorageChange)
//     }
//   }, [])

//   const loadBookingItems = () => {
//     try {
//       setLoading(true)
      
//       // ✅ PRIORITY 1: URL parameter (fresh booking dari "Lihat Detail")
//       if (equipmentId) {
//         console.log('📦 Loading initial equipment from URL:', equipmentId)
//         fetchEquipmentDetail(parseInt(equipmentId))
//         return
//       }
      
//       // ✅ PRIORITY 2: localStorage (dari TambahEquipment return)
//       const savedBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
//       if (savedBookingItems.length > 0) {
//         console.log('✅ Found saved booking session:', savedBookingItems.length, 'items')
//         setBookingItems(savedBookingItems)
//         setLoading(false)
//         return
//       }
      
//       // ✅ PRIORITY 3: No data
//       console.log('⚠️ No booking data - empty state')
//       setLoading(false)
      
//     } catch (error) {
//       console.error('❌ Error loading booking items:', error)
//       setLoading(false)
//     }
//   }

//   const fetchEquipmentDetail = async (id: number) => {
//     try {
//       console.log('🔍 Fetching initial equipment from API:', id)
      
//       const response = await fetch(
//         `http://localhost/PBL - KELANA OUTDOOR/api/public/equipment.php?id=${id}`
//       )
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
      
//       const text = await response.text()
//       const data = JSON.parse(text)
      
//       if (data.equipment_id) {
//         // ✅ STORE initial equipment untuk reset nanti
//         setInitialEquipment(data)
        
//         const initialBookingItems = [{
//           equipment: data,
//           quantity: 1
//         }]
        
//         setBookingItems(initialBookingItems)
//         localStorage.setItem('bookingItems', JSON.stringify(initialBookingItems))
//         console.log('✅ Initial equipment loaded and stored:', data.name)
//       } else {
//         throw new Error('Equipment tidak ditemukan')
//       }
      
//     } catch (err) {
//       console.error('❌ Error loading initial equipment:', err)
      
//       // Fallback equipment
//       const fallbackEquipment: Equipment = {
//         equipment_id: id,
//         name: `Equipment ${id} (Demo)`,
//         code: `DEMO-${id}`,
//         description: "Equipment demo untuk testing booking",
//         category: "demo",
//         size_capacity: "Demo",
//         dimensions: "Demo",
//         weight: 1,
//         material: "Demo",
//         stock_quantity: 10,
//         available_stock: 10,
//         reserved_stock: 0,
//         rented_stock: 0,
//         price_per_day: 25000,
//         condition: "baik",
//         equipment_type: "single",
//         image_url: null,
//         created_at: new Date().toISOString()
//       }
      
//       setInitialEquipment(fallbackEquipment)
      
//       const fallbackBookingItems = [{
//         equipment: fallbackEquipment,
//         quantity: 1
//       }]
      
//       setBookingItems(fallbackBookingItems)
//       localStorage.setItem('bookingItems', JSON.stringify(fallbackBookingItems))
//       console.log('✅ Fallback equipment loaded')
      
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ✅ UPDATE QUANTITY
//   const updateQuantity = (index: number, newQuantity: number) => {
//     if (newQuantity < 1) return
    
//     const updatedItems = bookingItems.map((item, i) => 
//       i === index 
//         ? { ...item, quantity: Math.min(newQuantity, item.equipment.stock_quantity) } 
//         : item
//     )
    
//     setBookingItems(updatedItems)
//     localStorage.setItem('bookingItems', JSON.stringify(updatedItems))
//   }

//   // ✅ REMOVE ITEM
//   const removeItem = (index: number) => {
//     const itemToRemove = bookingItems[index]
//     if (confirm(`❌ Hapus ${itemToRemove.equipment.name} dari booking?`)) {
//       const updatedItems = bookingItems.filter((_, i) => i !== index)
//       setBookingItems(updatedItems)
      
//       if (updatedItems.length === 0) {
//         localStorage.removeItem('bookingItems')
//       } else {
//         localStorage.setItem('bookingItems', JSON.stringify(updatedItems))
//       }
//     }
//   }

//   // ✅ CLEAR ALL BOOKING
//   const clearAllBooking = () => {
//     if (confirm('❌ Hapus semua equipment dari booking?')) {
//       setBookingItems([])
//       localStorage.removeItem('bookingItems')
//       alert('✅ Semua equipment dihapus dari booking')
//     }
//   }

//   // ✅ HANDLE BROWSE LAGI - Reset ke initial equipment
//   const handleBrowseAgain = () => {
//     console.log('🔄 User clicking Browse Lagi - will reset to initial equipment')
//     // localStorage akan di-reset di cleanup effect
//     navigate('/browse')
//   }

//   // ✅ HANDLE TAMBAH EQUIPMENT - Tidak langsung kembali
//   const handleTambahEquipment = () => {
//     console.log('➕ Going to TambahEquipment - user can add more items')
//     // Pass current booking untuk context
//     localStorage.setItem('bookingItems', JSON.stringify(bookingItems))
//     navigate('/tambah-equipment')
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))

//     // Auto calculate duration when dates change
//     if (name === 'start_date' || name === 'end_date') {
//       const start = name === 'start_date' ? new Date(value) : new Date(formData.start_date)
//       const end = name === 'end_date' ? new Date(value) : new Date(formData.end_date)
      
//       if (start && end && end > start) {
//         const diffTime = Math.abs(end.getTime() - start.getTime())
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
//         setFormData(prev => ({ ...prev, duration: diffDays }))
//       }
//     }
//   }

//   // ✅ CALCULATE TOTAL COST
//   const calculateTotalCost = () => {
//     return bookingItems.reduce((total, item) => {
//       return total + (item.equipment.price_per_day * item.quantity * formData.duration)
//     }, 0)
//   }

//   const generateWhatsAppMessage = () => {
//     if (bookingItems.length === 0) return ''

//     const totalCost = calculateTotalCost()

//     const itemsList = bookingItems.map(item => 
//       `• ${item.equipment.name} (${item.equipment.code}) - ${item.quantity}x - Rp ${(item.equipment.price_per_day * item.quantity).toLocaleString('id-ID')}/hari`
//     ).join('\n')

//     const message = `
// ⛰️ *BOOKING KELANA OUTDOOR*

// 👤 *DATA PENYEWA:*
// • Nama: ${formData.name}
// • HP: ${formData.phone}
// • Email: ${formData.email}
// • No. KTP: ${formData.identity_number}

// 🛍️ *PERALATAN:*
// ${itemsList}

// 🗓️ *PERIODE SEWA:*
// • Mulai: ${formData.start_date}
// • Selesai: ${formData.end_date} 
// • Durasi: ${formData.duration} hari

// 💰 *ESTIMASI BIAYA TOTAL:*
// Rp ${totalCost.toLocaleString('id-ID')}

// 📒 *CATATAN:*
// ${formData.notes || 'Tidak ada catatan khusus'}

// ---
// Mohon konfirmasi ketersediaan dan detail pembayaran. Terima kasih! 🙏
//     `.trim()

//     return encodeURIComponent(message)
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     // Validation
//     if (!formData.name || !formData.phone || !formData.start_date || !formData.end_date) {
//       alert('❌ Mohon lengkapi semua data yang diperlukan')
//       return
//     }

//     if (bookingItems.length === 0) {
//       alert('❌ Pilih minimal satu peralatan untuk disewa')
//       return
//     }

//     if (new Date(formData.end_date) <= new Date(formData.start_date)) {
//       alert('❌ Tanggal selesai harus setelah tanggal mulai')
//       return
//     }

//     // Generate WhatsApp link
//     const message = generateWhatsAppMessage()
//     const whatsappNumber = '6281344492934'
//     const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

//     // Open WhatsApp
//     window.open(whatsappUrl, '_blank')
    
//     // ✅ CLEAR booking setelah submit
//     setBookingItems([])
//     localStorage.removeItem('bookingItems')
//     alert('✅ Booking berhasil dikirim via WhatsApp!')
//   }

//   // ✅ LOADING STATE
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Memuat booking...</p>
//         </div>
//       </div>
//     )
//   }

//   // ✅ NO EQUIPMENT STATE
//   if (bookingItems.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600 text-xl mb-2">Keranjang Booking Kosong</p>
//           <p className="text-gray-500 mb-6">Pilih equipment yang ingin Anda sewa</p>
//           <div className="space-y-3">
//             <Button 
//               onClick={handleBrowseAgain}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               <Package className="h-4 w-4 mr-2" />
//               Browse Equipment
//             </Button>
//             <br />
//             <Button 
//               onClick={handleTambahEquipment}
//               variant="outline"
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Tambah Equipment
//             </Button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <Button 
//               onClick={handleBrowseAgain}
//               variant="ghost"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Browse Lagi
//             </Button>
            
//             {/* ✅ Status dengan initial equipment info */}
//             <div className="hidden md:block">
//               <p className="text-sm text-gray-600">
//                 🛒 <span className="font-medium">{bookingItems.length} equipment</span> dalam booking
//                 {initialEquipment && (
//                   <span className="text-xs text-gray-500 ml-2">
//                     (Started with: {initialEquipment.name})
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>
          
//           {/* Clear All Button */}
//           <Button 
//             variant="outline" 
//             onClick={clearAllBooking}
//             className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-500"
//           >
//             <Trash2 className="h-4 w-4 mr-2" />
//             Kosongkan Booking
//           </Button>
//         </div>

//         <div className="max-w-6xl mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Equipment Summary */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CheckCircle className="h-5 w-5 text-green-600" />
//                   Peralatan yang Dipilih ({bookingItems.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Display all equipment */}
//                 {bookingItems.map((item, index) => (
//                   <div key={`${item.equipment.equipment_id}-${index}`} className="border rounded-lg p-4 space-y-3 bg-white">
//                     {/* ✅ Mark initial equipment */}
//                     {initialEquipment && item.equipment.equipment_id === initialEquipment.equipment_id && (
//                       <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700 mb-2">
//                         📌 Initial Equipment (dari detail)
//                       </div>
//                     )}
                    
//                     {/* Equipment Display */}
//                     <div className="flex gap-3">
//                       <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                         <span className="text-white text-lg font-bold">
//                           {item.equipment.name.charAt(0)}
//                         </span>
//                       </div>
                      
//                       <div className="flex-1">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h4 className="font-semibold">{item.equipment.name}</h4>
//                             <div className="flex items-center gap-2 mt-1">
//                               <Badge variant="secondary" className="text-xs">
//                                 {item.equipment.category.toUpperCase()}
//                               </Badge>
//                               <span className="text-xs text-gray-500">{item.equipment.code}</span>
//                             </div>
//                             <p className="text-lg font-bold text-green-600 mt-1">
//                               Rp {item.equipment.price_per_day.toLocaleString('id-ID')}/hari
//                             </p>
//                           </div>
                          
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => removeItem(index)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Quantity Controls */}
//                     <div className="flex items-center gap-3">
//                       <span className="text-sm font-medium">Jumlah:</span>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => updateQuantity(index, item.quantity - 1)}
//                           disabled={item.quantity <= 1}
//                         >
//                           <Minus className="h-3 w-3" />
//                         </Button>
                        
//                         <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => updateQuantity(index, item.quantity + 1)}
//                           disabled={item.quantity >= item.equipment.stock_quantity}
//                         >
//                           <Plus className="h-3 w-3" />
//                         </Button>
//                       </div>
                      
//                       <span className="text-xs text-gray-500">
//                         (Stok: {item.equipment.stock_quantity})
//                       </span>
//                     </div>

//                     {/* Subtotal */}
//                     {formData.duration > 0 && (
//                       <div className="bg-gray-50 p-3 rounded text-sm">
//                         <p className="font-medium">
//                           Subtotal: Rp {(item.equipment.price_per_day * item.quantity * formData.duration).toLocaleString('id-ID')}
//                         </p>
//                         <p className="text-gray-600">
//                           {item.quantity}x untuk {formData.duration} hari
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 {/* Total Cost */}
//                 {formData.duration > 0 && (
//                   <div className="bg-green-50 p-4 rounded-lg border-t-2 border-green-600">
//                     <p className="font-bold text-green-800 text-lg">Total Estimasi:</p>
//                     <p className="text-3xl font-bold text-green-600">
//                       Rp {calculateTotalCost().toLocaleString('id-ID')}
//                     </p>
//                     <p className="text-sm text-green-600">untuk {formData.duration} hari</p>
//                   </div>
//                 )}

//                 {/* Tambah Equipment Button */}
//                 <Button 
//                   onClick={handleTambahEquipment}
//                   variant="outline" 
//                   className="w-full"
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Tambah Equipment Lain
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Form Booking - sama seperti sebelumnya */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Form Booking</CardTitle>
//                 <p className="text-sm text-gray-600">
//                   Isi data di bawah untuk melanjutkan ke WhatsApp
//                 </p>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {/* Personal Data */}
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="name">Nama Lengkap *</Label>
//                       <Input
//                         id="name"
//                         name="name"
//                         type="text"
//                         required
//                         value={formData.name}
//                         onChange={handleInputChange}
//                         placeholder="Nama sesuai KTP"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="phone">Nomor WhatsApp *</Label>
//                       <Input
//                         id="phone"
//                         name="phone"
//                         type="tel"
//                         required
//                         value={formData.phone}
//                         onChange={handleInputChange}
//                         placeholder="08xxxxxxxxxx"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         name="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         placeholder="email@contoh.com"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="identity_number">Nomor KTP</Label>
//                       <Input
//                         id="identity_number"
//                         name="identity_number"
//                         type="text"
//                         value={formData.identity_number}
//                         onChange={handleInputChange}
//                         placeholder="3201xxxxxxxxxxxxxx"
//                       />
//                     </div>
//                   </div>

//                   {/* Rental Period */}
//                   <div className="space-y-4 pt-4 border-t">
//                     <h4 className="font-medium flex items-center gap-2">
//                       <Calendar className="h-4 w-4" />
//                       Periode Sewa
//                     </h4>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="start_date">Tanggal Mulai *</Label>
//                         <Input
//                           id="start_date"
//                           name="start_date"
//                           type="date"
//                           required
//                           value={formData.start_date}
//                           onChange={handleInputChange}
//                           min={new Date().toISOString().split('T')[0]}
//                         />
//                       </div>

//                       <div>
//                         <Label htmlFor="end_date">Tanggal Selesai *</Label>
//                         <Input
//                           id="end_date"
//                           name="end_date"
//                           type="date"
//                           required
//                           value={formData.end_date}
//                           onChange={handleInputChange}
//                           min={formData.start_date || new Date().toISOString().split('T')[0]}
//                         />
//                       </div>
//                     </div>

//                     {formData.duration > 0 && (
//                       <p className="text-sm text-gray-600">
//                         Durasi: <span className="font-medium">{formData.duration} hari</span>
//                       </p>
//                     )}
//                   </div>

//                   {/* Notes */}
//                   <div>
//                     <Label htmlFor="notes">Catatan Tambahan</Label>
//                     <Textarea
//                       id="notes"
//                       name="notes"
//                       rows={3}
//                       value={formData.notes}
//                       onChange={handleInputChange}
//                       placeholder="Catatan khusus untuk penyewaan ini..."
//                     />
//                   </div>
                  
//                   <div className="bg-blue-50 p-3 rounded-lg">
//                     <p className="text-xs text-blue-700">
//                       📋 <strong>Catatan Penting:</strong> Ketika datang ke Kelana Outdoor, jangan lupa membawa kartu identitas (KTP) sebagai syarat dan kebijakan booking.
//                     </p>
//                   </div>

//                   {/* Submit Button */}
//                   <Button
//                     type="submit"
//                     className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
//                   >
//                     <MessageCircle className="h-5 w-5 mr-2" />
//                     🚀 Booking via WhatsApp
//                   </Button>

//                   <p className="text-xs text-gray-500 text-center">
//                     Dengan melanjutkan, Anda akan diarahkan ke WhatsApp untuk konfirmasi booking
//                   </p>
//                 </form>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BookingForm

// import { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
// import { ArrowLeft, Search, Plus, Check, ShoppingCart, AlertTriangle } from 'lucide-react'

// interface Equipment {
//   equipment_id: number;
//   name: string;
//   code: string;
//   description?: string;
//   category: string;
//   size_capacity?: string;
//   price_per_day: number;
//   stock_quantity: number;
// }

// interface BookingItem {
//   equipment: Equipment
//   quantity: number
// }

// const TambahEquipment = () => {
//   const navigate = useNavigate()
  
//   const [equipment, setEquipment] = useState<Equipment[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
//   // ✅ TRACK added equipment IDs untuk tombol abu-abu
//   const [addedEquipmentIds, setAddedEquipmentIds] = useState<Set<number>>(new Set())
//   const [currentBookingItems, setCurrentBookingItems] = useState<BookingItem[]>([])

//   useEffect(() => {
//     fetchEquipment()
//     loadCurrentBooking()
//   }, [])

//   // ✅ LOAD current booking items
//   const loadCurrentBooking = () => {
//     try {
//       const savedBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
//       setCurrentBookingItems(savedBookingItems)
      
//       // ✅ EXTRACT IDs yang sudah ada di booking
//       const existingIds = new Set(savedBookingItems.map((item: BookingItem) => item.equipment.equipment_id))
//       setAddedEquipmentIds(existingIds)
      
//       console.log('📦 Current booking loaded:', savedBookingItems.length, 'items')
//       console.log('🔍 Already added IDs:', Array.from(existingIds))
//     } catch (error) {
//       console.error('❌ Error loading current booking:', error)
//     }
//   }

//   const fetchEquipment = async () => {
//     try {
//       setLoading(true)
      
//       const response = await fetch('http://localhost/PBL - KELANA OUTDOOR/api/public/equipment.php')
      
//       if (response.ok) {
//         const data = await response.json()
//         if (Array.isArray(data)) {
//           setEquipment(data)
//           console.log('✅ Equipment loaded:', data.length, 'items')
//         }
//       } else {
//         throw new Error('API Error')
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching equipment:', error)
      
//       // ✅ FALLBACK demo data
//       const demoEquipment: Equipment[] = [
//         {
//           equipment_id: 101,
//           name: "Tenda Dome 4 Orang",
//           code: "TND-001",
//           description: "Tenda dome berkualitas untuk 4 orang",
//           category: "tenda",
//           size_capacity: "4 orang",
//           price_per_day: 35000,
//           stock_quantity: 15
//         },
//         {
//           equipment_id: 102,
//           name: "Sleeping Bag",
//           code: "SB-002",
//           description: "Sleeping bag hangat untuk camping",
//           category: "sleeping",
//           size_capacity: "1 orang",
//           price_per_day: 15000,
//           stock_quantity: 25
//         },
//         {
//           equipment_id: 103,
//           name: "Kompor Gas Portable",
//           code: "KG-003",
//           description: "Kompor gas portable untuk masak outdoor",
//           category: "memasak",
//           size_capacity: "Single burner",
//           price_per_day: 20000,
//           stock_quantity: 10
//         },
//         {
//           equipment_id: 104,
//           name: "Headlamp LED",
//           code: "HL-004",
//           description: "Senter kepala LED rechargeable",
//           category: "lighting",
//           size_capacity: "Personal",
//           price_per_day: 10000,
//           stock_quantity: 20
//         },
//         {
//           equipment_id: 105,
//           name: "Carrier 60L",
//           code: "CR-005",
//           description: "Tas carrier 60 liter untuk hiking",
//           category: "tas",
//           size_capacity: "60L",
//           price_per_day: 25000,
//           stock_quantity: 12
//         }
//       ]
      
//       setEquipment(demoEquipment)
//       console.log('✅ Demo equipment loaded')
      
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ✅ ADD EQUIPMENT ke booking dengan status tracking
//   const addToBooking = (selectedEquipment: Equipment) => {
//     try {
//       // ✅ CHECK if already added
//       if (addedEquipmentIds.has(selectedEquipment.equipment_id)) {
//         alert('⚠️ Equipment sudah ditambahkan ke booking')
//         return
//       }

//       // ✅ LOAD current booking
//       const existingBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
      
//       // ✅ CHECK if equipment already exists (increase quantity)
//       const existingIndex = existingBookingItems.findIndex(
//         (item: BookingItem) => item.equipment.equipment_id === selectedEquipment.equipment_id
//       )

//       let updatedBookingItems
//       if (existingIndex >= 0) {
//         // ✅ INCREASE quantity if already exists
//         updatedBookingItems = existingBookingItems.map((item: BookingItem, index: number) => 
//           index === existingIndex 
//             ? { ...item, quantity: Math.min(item.quantity + 1, selectedEquipment.stock_quantity) }
//             : item
//         )
//         alert(`✅ Quantity ${selectedEquipment.name} ditambah 1`)
//       } else {
//         // ✅ ADD new equipment
//         const newBookingItem: BookingItem = {
//           equipment: selectedEquipment,
//           quantity: 1
//         }
//         updatedBookingItems = [...existingBookingItems, newBookingItem]
//         alert(`✅ ${selectedEquipment.name} berhasil ditambahkan ke booking!`)
//       }
      
//       // ✅ SAVE to localStorage
//       localStorage.setItem('bookingItems', JSON.stringify(updatedBookingItems))
      
//       // ✅ UPDATE state untuk UI
//       setCurrentBookingItems(updatedBookingItems)
//       setAddedEquipmentIds(prev => new Set([...prev, selectedEquipment.equipment_id]))
      
//       // ✅ DISPATCH event untuk BookingForm
//       window.dispatchEvent(new CustomEvent('bookingUpdated'))
      
//       console.log(`✅ ${selectedEquipment.name} ditambahkan ke booking`)
      
//     } catch (error) {
//       console.error('❌ Error adding to booking:', error)
//       alert('❌ Gagal menambahkan equipment ke booking')
//     }
//   }

//   // ✅ FILTER equipment
//   const filteredEquipment = equipment.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
//     const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
//     return matchesSearch && matchesCategory
//   })

//   // ✅ GET unique categories
//   const categories = ['all', ...Array.from(new Set(equipment.map(item => item.category)))]

//   // ✅ LOADING STATE
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Memuat equipment...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
        
//         {/* ✅ HEADER dengan info current booking */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <Link to="/booking/form">
//               <Button variant="ghost">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Kembali ke Booking
//               </Button>
//             </Link>
            
//             {/* Current Booking Info */}
//             <div className="hidden md:block">
//               <p className="text-sm text-gray-600">
//                 🛒 <span className="font-medium">{currentBookingItems.length} equipment</span> dalam booking
//               </p>
//             </div>
//           </div>
          
//           {/* Go to Booking Button */}
//           <Link to="/booking/form">
//             <Button className="bg-green-600 hover:bg-green-700">
//               <ShoppingCart className="h-4 w-4 mr-2" />
//               Lihat Booking ({currentBookingItems.length})
//             </Button>
//           </Link>
//         </div>

//         <div className="max-w-6xl mx-auto">
//           <Card>
//             <CardHeader>
//               <CardTitle>Tambah Equipment ke Booking</CardTitle>
//               <p className="text-sm text-gray-600">
//                 Pilih equipment tambahan yang ingin Anda sewa
//               </p>
//             </CardHeader>
//             <CardContent>
              
//               {/* ✅ SEARCH & FILTER */}
//               <div className="space-y-4 mb-6">
                
//                 {/* Search */}
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <Input
//                     type="text"
//                     placeholder="Cari equipment..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>

//                 {/* Category Filter */}
//                 <div className="flex flex-wrap gap-2">
//                   {categories.map(category => (
//                     <Button
//                       key={category}
//                       variant={selectedCategory === category ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setSelectedCategory(category)}
//                       className="capitalize"
//                     >
//                       {category === 'all' ? 'Semua' : category}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               {/* ✅ EQUIPMENT GRID */}
//               {filteredEquipment.length === 0 ? (
//                 <div className="text-center py-12">
//                   <p className="text-gray-500 text-lg">Tidak ada equipment yang ditemukan</p>
//                   <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci pencarian atau filter kategori</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {filteredEquipment.map((item) => {
//                     const isAdded = addedEquipmentIds.has(item.equipment_id)
                    
//                     return (
//                       <Card key={item.equipment_id} className={`hover:shadow-lg transition-shadow ${isAdded ? 'bg-gray-50 border-gray-300' : 'bg-white'}`}>
//                         <CardContent className="p-4">
                          
//                           {/* ✅ ADDED INDICATOR */}
//                           {isAdded && (
//                             <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mb-3 flex items-center gap-1">
//                               <Check className="h-3 w-3" />
//                               Sudah ditambahkan
//                             </div>
//                           )}
                          
//                           {/* Equipment Image Placeholder */}
//                           <div className={`w-full h-32 rounded-lg flex items-center justify-center mb-3 ${isAdded ? 'bg-gray-300' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
//                             <span className={`text-xl font-bold ${isAdded ? 'text-gray-500' : 'text-white'}`}>
//                               {item.name.charAt(0)}
//                             </span>
//                           </div>

//                           {/* Equipment Info */}
//                           <div className="space-y-2">
//                             <div className="flex items-center justify-between">
//                               <h3 className={`font-semibold ${isAdded ? 'text-gray-500' : 'text-gray-900'}`}>
//                                 {item.name}
//                               </h3>
//                               <Badge 
//                                 variant="secondary" 
//                                 className={`text-xs ${isAdded ? 'bg-gray-200 text-gray-500' : ''}`}
//                               >
//                                 {item.category.toUpperCase()}
//                               </Badge>
//                             </div>

//                             <p className={`text-xs ${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                               {item.code}
//                             </p>

//                             {item.description && (
//                               <p className={`text-sm ${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                                 {item.description}
//                               </p>
//                             )}

//                             <div className="space-y-1 text-sm">
//                               {item.size_capacity && (
//                                 <p className={`${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                                   📏 {item.size_capacity}
//                                 </p>
//                               )}
                              
//                               <p className={`${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                                 📦 Stok: {item.stock_quantity}
//                               </p>
//                             </div>

//                             <div className="flex justify-between items-center pt-2">
//                               <p className={`font-bold text-lg ${isAdded ? 'text-gray-400' : 'text-green-600'}`}>
//                                 Rp {item.price_per_day.toLocaleString('id-ID')}/hari
//                               </p>
//                             </div>

//                             {/* ✅ ADD BUTTON dengan conditional styling */}
//                             <Button
//                               onClick={() => addToBooking(item)}
//                               disabled={isAdded || item.stock_quantity === 0}
//                               className={`w-full mt-3 ${
//                                 isAdded 
//                                   ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white' 
//                                   : item.stock_quantity === 0
//                                     ? 'bg-red-400 hover:bg-red-400 cursor-not-allowed'
//                                     : 'bg-green-600 hover:bg-green-700'
//                               }`}
//                             >
//                               {isAdded ? (
//                                 <>
//                                   <Check className="h-4 w-4 mr-2" />
//                                   Sudah Ditambahkan
//                                 </>
//                               ) : item.stock_quantity === 0 ? (
//                                 'Stok Habis'
//                               ) : (
//                                 <>
//                                   <Plus className="h-4 w-4 mr-2" />
//                                   Tambah ke Booking
//                                 </>
//                               )}
//                             </Button>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     )
//                   })}
//                 </div>
//               )}

//               {/* ✅ BOTTOM ACTION */}
//               <div className="mt-8 pt-6 border-t">
//                 <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//                   <p className="text-sm text-gray-600">
//                     {currentBookingItems.length > 0 ? (
//                       <>✅ {currentBookingItems.length} equipment sudah dipilih untuk booking</>
//                     ) : (
//                       <>📋 Belum ada equipment yang dipilih</>
//                     )}
//                   </p>
                  
//                   <div className="flex gap-3">
//                     <Link to="/browse">
//                       <Button variant="outline">
//                         Kembali ke Browse
//                       </Button>
//                     </Link>
                    
//                     <Link to="/booking/form">
//                       <Button 
//                         className="bg-green-600 hover:bg-green-700"
//                         disabled={currentBookingItems.length === 0}
//                       >
//                         <ShoppingCart className="h-4 w-4 mr-2" />
//                         Lanjut ke Booking ({currentBookingItems.length})
//                       </Button>
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TambahEquipment

// import { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
// import { ArrowLeft, Search, Plus, Check, ShoppingCart, AlertTriangle, Image as ImageIcon } from 'lucide-react'

// interface Equipment {
//   equipment_id: number;
//   name: string;
//   code: string;
//   description?: string;
//   category: string;
//   size_capacity?: string;
//   price_per_day: number;
//   stock_quantity: number;
//   image_url?: string;  // ✅ TAMBAHKAN image_url
// }

// interface BookingItem {
//   equipment: Equipment
//   quantity: number
// }

// const TambahEquipment = () => {
//   const navigate = useNavigate()
  
//   const [equipment, setEquipment] = useState<Equipment[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
//   // ✅ TRACK added equipment IDs untuk tombol abu-abu
//   const [addedEquipmentIds, setAddedEquipmentIds] = useState<Set<number>>(new Set())
//   const [currentBookingItems, setCurrentBookingItems] = useState<BookingItem[]>([])

//   useEffect(() => {
//     fetchEquipment()
//     loadCurrentBooking()
//   }, [])

// const buildImageUrl = (item: Equipment) => {
//     if (!item.image_url) return null;
    
//     console.log('🖼️ Original image_url:', item.image_url);
    
//     // Jika sudah full URL, return as is
//     if (item.image_url.startsWith('http')) {
//       return item.image_url;
//     }
    
//     // ✅ PERBAIKAN: Pastikan path yang benar
//     if (item.image_url.startsWith('/uploads/')) {
//       // Path sudah lengkap dari root, tambahkan base URL
//       return `http://localhost/PBL - KELANA OUTDOOR${item.image_url}`;
//     }
    
//     if (item.image_url.startsWith('uploads/')) {
//       // Path tanpa slash di depan
//       return `http://localhost/PBL - KELANA OUTDOOR/${item.image_url}`;
//     }
    
//     // Jika hanya nama file saja
//     return `http://localhost/PBL - KELANA OUTDOOR/uploads/equipment/${item.image_url}`;
//   };

//   // ✅ TAMBAHKAN FUNCTION UNTUK HANDLE IMAGE ERROR
//   const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, item: Equipment) => {
//     const img = e.target as HTMLImageElement;
    
//     console.log(`❌ Image load error for ${item.code}:`, item.image_url);
//     console.log('❌ Failed URL:', img.src);
    
//     // Hide failed image and show fallback
//     img.style.display = 'none';
//     const fallback = img.nextElementSibling as HTMLElement;
//     if (fallback && fallback.classList.contains('image-fallback')) {
//       fallback.style.display = 'flex';
//     }
//   };

//   // ✅ TAMBAHKAN FUNCTION UNTUK HANDLE IMAGE LOAD SUCCESS
//   const handleImageLoad = (item: Equipment) => {
//     console.log(`✅ Image loaded successfully for ${item.code}`);
//   };

//   // ✅ LOAD current booking items - FIX TYPE ERROR
//   const loadCurrentBooking = () => {
//     try {
//       const savedBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
//       setCurrentBookingItems(savedBookingItems)
      
//       // ✅ FIX: Pastikan type yang benar dan handle empty array
//       if (Array.isArray(savedBookingItems) && savedBookingItems.length > 0) {
//         const existingIds = new Set<number>(
//           savedBookingItems.map((item: any) => item.equipment?.equipment_id).filter(id => id !== undefined)
//         )
//         setAddedEquipmentIds(existingIds)
        
//         console.log('📦 Current booking loaded:', savedBookingItems.length, 'items')
//         console.log('🔍 Already added IDs:', Array.from(existingIds))
//       } else {
//         setAddedEquipmentIds(new Set())
//         console.log('📦 No current booking items found')
//       }
//     } catch (error) {
//       console.error('❌ Error loading current booking:', error)
//       setAddedEquipmentIds(new Set())
//     }
//   }

//   const fetchEquipment = async () => {
//     try {
//       setLoading(true)
      
//       const response = await fetch('http://localhost/PBL - KELANA OUTDOOR/api/public/equipment.php')
      
//       if (response.ok) {
//         const data = await response.json()
//         if (Array.isArray(data)) {
//           setEquipment(data)
//           console.log('✅ Equipment loaded:', data.length, 'items')
//         }
//       } else {
//         throw new Error('API Error')
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching equipment:', error)
      
//       // ✅ FALLBACK demo data DENGAN image_url
//       const demoEquipment: Equipment[] = [
//         {
//           equipment_id: 101,
//           name: "Tenda Dome 4 Orang",
//           code: "TND-001",
//           description: "Tenda dome berkualitas untuk 4 orang",
//           category: "tenda",
//           size_capacity: "4 orang",
//           price_per_day: 35000,
//           stock_quantity: 15,
//           image_url: null
//         },
//         {
//           equipment_id: 102,
//           name: "Sleeping Bag",
//           code: "SB-002",
//           description: "Sleeping bag hangat untuk camping",
//           category: "sleeping",
//           size_capacity: "1 orang",
//           price_per_day: 15000,
//           stock_quantity: 25,
//           image_url: null
//         },
//         {
//           equipment_id: 103,
//           name: "Kompor Gas Portable",
//           code: "KG-003",
//           description: "Kompor gas portable untuk masak outdoor",
//           category: "memasak",
//           size_capacity: "Single burner",
//           price_per_day: 20000,
//           stock_quantity: 10,
//           image_url: null
//         },
//         {
//           equipment_id: 104,
//           name: "Headlamp LED",
//           code: "HL-004",
//           description: "Senter kepala LED rechargeable",
//           category: "lighting",
//           size_capacity: "Personal",
//           price_per_day: 10000,
//           stock_quantity: 20,
//           image_url: null
//         },
//         {
//           equipment_id: 105,
//           name: "Carrier 60L",
//           code: "CR-005",
//           description: "Tas carrier 60 liter untuk hiking",
//           category: "tas",
//           size_capacity: "60L",
//           price_per_day: 25000,
//           stock_quantity: 12,
//           image_url: null
//         }
//       ]
      
//       setEquipment(demoEquipment)
//       console.log('✅ Demo equipment loaded')
      
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ✅ ADD EQUIPMENT ke booking dengan status tracking - FIX TYPE
//   const addToBooking = (selectedEquipment: Equipment) => {
//     try {
//       // ✅ CHECK if already added
//       if (addedEquipmentIds.has(selectedEquipment.equipment_id)) {
//         alert('⚠️ Equipment sudah ditambahkan ke booking')
//         return
//       }

//       // ✅ LOAD current booking
//       const existingBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
      
//       // ✅ CHECK if equipment already exists (increase quantity)
//       const existingIndex = existingBookingItems.findIndex(
//         (item: any) => item.equipment?.equipment_id === selectedEquipment.equipment_id
//       )

//       let updatedBookingItems
//       if (existingIndex >= 0) {
//         // ✅ INCREASE quantity if already exists
//         updatedBookingItems = existingBookingItems.map((item: any, index: number) => 
//           index === existingIndex 
//             ? { ...item, quantity: Math.min(item.quantity + 1, selectedEquipment.stock_quantity) }
//             : item
//         )
//         alert(`✅ Quantity ${selectedEquipment.name} ditambah 1`)
//       } else {
//         // ✅ ADD new equipment
//         const newBookingItem: BookingItem = {
//           equipment: selectedEquipment,
//           quantity: 1
//         }
//         updatedBookingItems = [...existingBookingItems, newBookingItem]
//         alert(`✅ ${selectedEquipment.name} berhasil ditambahkan ke booking!`)
//       }
      
//       // ✅ SAVE to localStorage
//       localStorage.setItem('bookingItems', JSON.stringify(updatedBookingItems))
      
//       // ✅ UPDATE state untuk UI
//       setCurrentBookingItems(updatedBookingItems)
//       setAddedEquipmentIds(prev => new Set([...prev, selectedEquipment.equipment_id]))
      
//       // ✅ DISPATCH event untuk BookingForm
//       window.dispatchEvent(new CustomEvent('bookingItemsUpdated'))
      
//       console.log(`✅ ${selectedEquipment.name} ditambahkan ke booking`)
      
//     } catch (error) {
//       console.error('❌ Error adding to booking:', error)
//       alert('❌ Gagal menambahkan equipment ke booking')
//     }
//   }

//   // ✅ FILTER equipment
//   const filteredEquipment = equipment.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
//     const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
//     return matchesSearch && matchesCategory
//   })

//   // ✅ GET unique categories
//   const categories = ['all', ...Array.from(new Set(equipment.map(item => item.category)))]

//   // ✅ LOADING STATE
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Memuat equipment...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
        
//         {/* ✅ HEADER dengan info current booking */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <Link to="/booking/form">
//               <Button variant="ghost">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Kembali ke Booking
//               </Button>
//             </Link>
            
//             {/* Current Booking Info */}
//             <div className="hidden md:block">
//               <p className="text-sm text-gray-600">
//                 🛒 <span className="font-medium">{currentBookingItems.length} equipment</span> dalam booking
//               </p>
//             </div>
//           </div>
          
//           {/* Go to Booking Button */}
//           <Link to="/booking/form">
//             <Button className="bg-green-600 hover:bg-green-700">
//               <ShoppingCart className="h-4 w-4 mr-2" />
//               Lihat Booking ({currentBookingItems.length})
//             </Button>
//           </Link>
//         </div>

//         <div className="max-w-6xl mx-auto">
//           <Card>
//             <CardHeader>
//               <CardTitle>Tambah Equipment ke Booking</CardTitle>
//               <p className="text-sm text-gray-600">
//                 Pilih equipment tambahan yang ingin Anda sewa
//               </p>
//             </CardHeader>
//             <CardContent>
              
//               {/* ✅ SEARCH & FILTER */}
//               <div className="space-y-4 mb-6">
                
//                 {/* Search */}
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <Input
//                     type="text"
//                     placeholder="Cari equipment..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>

//                 {/* Category Filter */}
//                 <div className="flex flex-wrap gap-2">
//                   {categories.map(category => (
//                     <Button
//                       key={category}
//                       variant={selectedCategory === category ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setSelectedCategory(category)}
//                       className="capitalize"
//                     >
//                       {category === 'all' ? 'Semua' : category}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               {/* ✅ EQUIPMENT GRID */}
//               {filteredEquipment.length === 0 ? (
//                 <div className="text-center py-12">
//                   <p className="text-gray-500 text-lg">Tidak ada equipment yang ditemukan</p>
//                   <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci pencarian atau filter kategori</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {filteredEquipment.map((item) => {
//                     const isAdded = addedEquipmentIds.has(item.equipment_id)
                    
//                     return (
//                       <Card key={item.equipment_id} className={`hover:shadow-lg transition-shadow ${isAdded ? 'bg-gray-50 border-gray-300' : 'bg-white'}`}>
//                         <CardContent className="p-4">
                          
//                           {/* ✅ ADDED INDICATOR */}
//                           {isAdded && (
//                             <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mb-3 flex items-center gap-1">
//                               <Check className="h-3 w-3" />
//                               Sudah ditambahkan
//                             </div>
//                           )}
                          
//                           {/* ✅ EQUIPMENT IMAGE - SAMA SEPERTI EQUIPMENT DETAIL */}
//                           <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
//                             {item.image_url ? (
//                               <>
//                                 <img 
//                                   src={`http://localhost${item.image_url}`}
//                                   alt={item.name}
//                                   className="w-full h-full object-cover"
//                                   onError={(e) => {
//                                     console.error('❌ Image failed to load:', item.image_url)
//                                     ;(e.target as HTMLImageElement).style.display = 'none'
//                                     const nextElement = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
//                                     if (nextElement) {
//                                       nextElement.style.display = 'flex'
//                                     }
//                                   }}
//                                 />
//                                 {/* Fallback jika gambar error */}
//                                 <div className={`w-full h-full hidden items-center justify-center ${isAdded ? 'bg-gray-300' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
//                                   <div className="text-center text-white">
//                                     <ImageIcon className={`h-8 w-8 mx-auto mb-2 ${isAdded ? 'text-gray-500' : 'text-white opacity-70'}`} />
//                                     <span className={`text-lg font-bold ${isAdded ? 'text-gray-500' : 'text-white'}`}>
//                                       {item.name.charAt(0)}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </>
//                             ) : (
//                               <div className={`w-full h-full flex items-center justify-center ${isAdded ? 'bg-gray-300' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
//                                 <div className="text-center">
//                                   <span className={`text-xl font-bold ${isAdded ? 'text-gray-500' : 'text-white'}`}>
//                                     {item.name.charAt(0)}
//                                   </span>
//                                   <p className={`text-xs mt-1 ${isAdded ? 'text-gray-400' : 'text-white opacity-70'}`}>
//                                     No Image
//                                   </p>
//                                 </div>
//                               </div>
//                             )}
//                           </div>

//                           {/* Equipment Info */}
//                           <div className="space-y-2">
//                             <div className="flex items-center justify-between">
//                               <h3 className={`font-semibold ${isAdded ? 'text-gray-500' : 'text-gray-900'}`}>
//                                 {item.name}
//                               </h3>
//                               <Badge 
//                                 variant="secondary" 
//                                 className={`text-xs ${isAdded ? 'bg-gray-200 text-gray-500' : ''}`}
//                               >
//                                 {item.category.toUpperCase()}
//                               </Badge>
//                             </div>

//                             <p className={`text-xs ${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                               {item.code}
//                             </p>

//                             {item.description && (
//                               <p className={`text-sm ${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                                 {item.description}
//                               </p>
//                             )}

//                             <div className="space-y-1 text-sm">
//                               {item.size_capacity && (
//                                 <p className={`${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                                   📏 {item.size_capacity}
//                                 </p>
//                               )}
                              
//                               <p className={`${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
//                                 📦 Stok: {item.stock_quantity}
//                               </p>
//                             </div>

//                             <div className="flex justify-between items-center pt-2">
//                               <p className={`font-bold text-lg ${isAdded ? 'text-gray-400' : 'text-green-600'}`}>
//                                 Rp {item.price_per_day.toLocaleString('id-ID')}/hari
//                               </p>
//                             </div>

//                             {/* ✅ ADD BUTTON dengan conditional styling */}
//                             <Button
//                               onClick={() => addToBooking(item)}
//                               disabled={isAdded || item.stock_quantity === 0}
//                               className={`w-full mt-3 ${
//                                 isAdded 
//                                   ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white' 
//                                   : item.stock_quantity === 0
//                                     ? 'bg-red-400 hover:bg-red-400 cursor-not-allowed'
//                                     : 'bg-green-600 hover:bg-green-700'
//                               }`}
//                             >
//                               {isAdded ? (
//                                 <>
//                                   <Check className="h-4 w-4 mr-2" />
//                                   Sudah Ditambahkan
//                                 </>
//                               ) : item.stock_quantity === 0 ? (
//                                 'Stok Habis'
//                               ) : (
//                                 <>
//                                   <Plus className="h-4 w-4 mr-2" />
//                                   Tambah ke Booking
//                                 </>
//                               )}
//                             </Button>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     )
//                   })}
//                 </div>
//               )}

//               {/* ✅ BOTTOM ACTION */}
//               <div className="mt-8 pt-6 border-t">
//                 <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//                   <p className="text-sm text-gray-600">
//                     {currentBookingItems.length > 0 ? (
//                       <>✅ {currentBookingItems.length} equipment sudah dipilih untuk booking</>
//                     ) : (
//                       <>📋 Belum ada equipment yang dipilih</>
//                     )}
//                   </p>
                  
//                   <div className="flex gap-3">
//                     <Link to="/browse">
//                       <Button variant="outline">
//                         Kembali ke Browse
//                       </Button>
//                     </Link>
                    
//                     <Link to="/booking/form">
//                       <Button 
//                         className="bg-green-600 hover:bg-green-700"
//                         disabled={currentBookingItems.length === 0}
//                       >
//                         <ShoppingCart className="h-4 w-4 mr-2" />
//                         Lanjut ke Booking ({currentBookingItems.length})
//                       </Button>
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TambahEquipment

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Plus, Check, ShoppingCart, AlertTriangle, Image as ImageIcon } from 'lucide-react'

interface Equipment {
  equipment_id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  size_capacity?: string;
  price_per_day: number;
  stock_quantity: number;
  image_url?: string;
}

interface BookingItem {
  equipment: Equipment
  quantity: number
}

const TambahEquipment = () => {
  const navigate = useNavigate()
  
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // ✅ TRACK added equipment IDs untuk tombol abu-abu
  const [addedEquipmentIds, setAddedEquipmentIds] = useState<Set<number>>(new Set())
  const [currentBookingItems, setCurrentBookingItems] = useState<BookingItem[]>([])

  useEffect(() => {
    fetchEquipment()
    loadCurrentBooking()
  }, [])

  // ✅ ENHANCED IMAGE URL BUILDER - sama seperti di halaman lain
  const buildImageUrl = (item: Equipment) => {
    if (!item.image_url) return null;
    
    console.log('🖼️ Original image_url:', item.image_url);
    
    // Jika sudah full URL, return as is
    if (item.image_url.startsWith('http')) {
      return item.image_url;
    }
    
    // ✅ PERBAIKAN: Pastikan path yang benar
    if (item.image_url.startsWith('/uploads/')) {
      // Path sudah lengkap dari root, tambahkan base URL
      return `http://localhost/PBL-KELANA-OUTDOOR${item.image_url}`;
    }
    
    if (item.image_url.startsWith('uploads/')) {
      // Path tanpa slash di depan
      return `http://localhost/PBL-KELANA-OUTDOOR/${item.image_url}`;
    }
    
    // Jika hanya nama file saja
    return `http://localhost/PBL-KELANA-OUTDOOR/uploads/equipment/${item.image_url}`;
  };

  // ✅ ENHANCED ERROR HANDLER - sama seperti di halaman lain
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, item: Equipment) => {
    const img = e.target as HTMLImageElement;
    
    console.log(`❌ Image load error for ${item.code}:`, item.image_url);
    console.log('❌ Failed URL:', img.src);
    
    // Hide failed image and show fallback
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback && fallback.classList.contains('image-fallback')) {
      fallback.style.display = 'flex';
    }
  };

  // ✅ SUCCESS HANDLER - sama seperti di halaman lain
  const handleImageLoad = (item: Equipment) => {
    console.log(`✅ Image loaded successfully for ${item.code}`);
  };

  // ✅ LOAD current booking items - FIX TYPE ERROR
  const loadCurrentBooking = () => {
    try {
      const savedBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
      setCurrentBookingItems(savedBookingItems)
      
      // ✅ FIX: Pastikan type yang benar dan handle empty array
      if (Array.isArray(savedBookingItems) && savedBookingItems.length > 0) {
        const existingIds = new Set<number>(
          savedBookingItems.map((item: any) => item.equipment?.equipment_id).filter(id => id !== undefined)
        )
        setAddedEquipmentIds(existingIds)
        
        console.log('📦 Current booking loaded:', savedBookingItems.length, 'items')
        console.log('🔍 Already added IDs:', Array.from(existingIds))
      } else {
        setAddedEquipmentIds(new Set())
        console.log('📦 No current booking items found')
      }
    } catch (error) {
      console.error('❌ Error loading current booking:', error)
      setAddedEquipmentIds(new Set())
    }
  }

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/public/equipment.php')
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setEquipment(data)
          console.log('✅ Equipment loaded:', data.length, 'items')
        }
      } else {
        throw new Error('API Error')
      }
      
    } catch (error) {
      console.error('❌ Error fetching equipment:', error)
      
      // ✅ FALLBACK demo data DENGAN image_url
      const demoEquipment: Equipment[] = [
        {
          equipment_id: 101,
          name: "Tenda Dome 4 Orang",
          code: "TND-001",
          description: "Tenda dome berkualitas untuk 4 orang",
          category: "tenda",
          size_capacity: "4 orang",
          price_per_day: 35000,
          stock_quantity: 15,
          image_url: null
        },
        {
          equipment_id: 102,
          name: "Sleeping Bag",
          code: "SB-002",
          description: "Sleeping bag hangat untuk camping",
          category: "sleeping",
          size_capacity: "1 orang",
          price_per_day: 15000,
          stock_quantity: 25,
          image_url: null
        },
        {
          equipment_id: 103,
          name: "Kompor Gas Portable",
          code: "KG-003",
          description: "Kompor gas portable untuk masak outdoor",
          category: "memasak",
          size_capacity: "Single burner",
          price_per_day: 20000,
          stock_quantity: 10,
          image_url: null
        },
        {
          equipment_id: 104,
          name: "Headlamp LED",
          code: "HL-004",
          description: "Senter kepala LED rechargeable",
          category: "lighting",
          size_capacity: "Personal",
          price_per_day: 10000,
          stock_quantity: 20,
          image_url: null
        },
        {
          equipment_id: 105,
          name: "Carrier 60L",
          code: "CR-005",
          description: "Tas carrier 60 liter untuk hiking",
          category: "tas",
          size_capacity: "60L",
          price_per_day: 25000,
          stock_quantity: 12,
          image_url: null
        }
      ]
      
      setEquipment(demoEquipment)
      console.log('✅ Demo equipment loaded')
      
    } finally {
      setLoading(false)
    }
  }

  // ✅ ADD EQUIPMENT ke booking dengan status tracking - FIX TYPE
  const addToBooking = (selectedEquipment: Equipment) => {
    try {
      // ✅ CHECK if already added
      if (addedEquipmentIds.has(selectedEquipment.equipment_id)) {
        alert('⚠️ Equipment sudah ditambahkan ke booking')
        return
      }

      // ✅ LOAD current booking
      const existingBookingItems = JSON.parse(localStorage.getItem('bookingItems') || '[]')
      
      // ✅ CHECK if equipment already exists (increase quantity)
      const existingIndex = existingBookingItems.findIndex(
        (item: any) => item.equipment?.equipment_id === selectedEquipment.equipment_id
      )

      let updatedBookingItems
      if (existingIndex >= 0) {
        // ✅ INCREASE quantity if already exists
        updatedBookingItems = existingBookingItems.map((item: any, index: number) => 
          index === existingIndex 
            ? { ...item, quantity: Math.min(item.quantity + 1, selectedEquipment.stock_quantity) }
            : item
        )
        alert(`✅ Quantity ${selectedEquipment.name} ditambah 1`)
      } else {
        // ✅ ADD new equipment
        const newBookingItem: BookingItem = {
          equipment: selectedEquipment,
          quantity: 1
        }
        updatedBookingItems = [...existingBookingItems, newBookingItem]
        alert(`✅ ${selectedEquipment.name} berhasil ditambahkan ke booking!`)
      }
      
      // ✅ SAVE to localStorage
      localStorage.setItem('bookingItems', JSON.stringify(updatedBookingItems))
      
      // ✅ UPDATE state untuk UI
      setCurrentBookingItems(updatedBookingItems)
      setAddedEquipmentIds(prev => new Set([...prev, selectedEquipment.equipment_id]))
      
      // ✅ DISPATCH event untuk BookingForm
      window.dispatchEvent(new CustomEvent('bookingItemsUpdated'))
      
      console.log(`✅ ${selectedEquipment.name} ditambahkan ke booking`)
      
    } catch (error) {
      console.error('❌ Error adding to booking:', error)
      alert('❌ Gagal menambahkan equipment ke booking')
    }
  }

  // ✅ FILTER equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // ✅ GET unique categories
  const categories = ['all', ...Array.from(new Set(equipment.map(item => item.category)))]

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat equipment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* ✅ HEADER dengan info current booking */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to="/booking/form">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Booking
              </Button>
            </Link>
            
            {/* Current Booking Info */}
            <div className="hidden md:block">
              <p className="text-sm text-gray-600">
                🛒 <span className="font-medium">{currentBookingItems.length} equipment</span> dalam booking
              </p>
            </div>
          </div>
          
          {/* Go to Booking Button */}
          <Link to="/booking/form">
            <Button className="bg-green-600 hover:bg-green-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Lihat Booking ({currentBookingItems.length})
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Equipment ke Booking</CardTitle>
              <p className="text-sm text-gray-600">
                Pilih equipment tambahan yang ingin Anda sewa
              </p>
            </CardHeader>
            <CardContent>
              
              {/* ✅ SEARCH & FILTER */}
              <div className="space-y-4 mb-6">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Cari equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category === 'all' ? 'Semua' : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* ✅ EQUIPMENT GRID */}
              {filteredEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Tidak ada equipment yang ditemukan</p>
                  <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci pencarian atau filter kategori</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEquipment.map((item) => {
                    const isAdded = addedEquipmentIds.has(item.equipment_id)
                    
                    return (
                      <Card key={item.equipment_id} className={`hover:shadow-lg transition-shadow ${isAdded ? 'bg-gray-50 border-gray-300' : 'bg-white'}`}>
                        <CardContent className="p-4">
                          
                          {/* ✅ ADDED INDICATOR */}
                          {isAdded && (
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mb-3 flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Sudah ditambahkan
                            </div>
                          )}
                          
                          {/* ✅ ENHANCED EQUIPMENT IMAGE - consistent dengan halaman lain */}
                          <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3 relative">
                            {item.image_url ? (
                              <>
                                <img 
                                  key={`tambah-img-${item.equipment_id}-${Date.now()}`}
                                  src={buildImageUrl(item)}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                  onError={(e) => handleImageError(e, item)}
                                  onLoad={() => handleImageLoad(item)}
                                  style={{ display: 'block' }}
                                />
                                {/* ✅ ENHANCED FALLBACK jika gambar error */}
                                <div className={`image-fallback absolute inset-0 hidden items-center justify-center ${isAdded ? 'bg-gray-300' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                                  <div className="text-center text-white">
                                    <ImageIcon className={`h-8 w-8 mx-auto mb-2 ${isAdded ? 'text-gray-500' : 'text-white opacity-70'}`} />
                                    <span className={`text-lg font-bold ${isAdded ? 'text-gray-500' : 'text-white'}`}>
                                      {item.name.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* ✅ ENHANCED PLACEHOLDER jika belum ada gambar */
                              <div className={`w-full h-full flex items-center justify-center ${isAdded ? 'bg-gray-300' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
                                <div className="text-center">
                                  <span className={`text-xl font-bold ${isAdded ? 'text-gray-500' : 'text-white'}`}>
                                    {item.name.charAt(0)}
                                  </span>
                                  <p className={`text-xs mt-1 ${isAdded ? 'text-gray-400' : 'text-white opacity-70'}`}>
                                    No Image
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Equipment Info */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold ${isAdded ? 'text-gray-500' : 'text-gray-900'}`}>
                                {item.name}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${isAdded ? 'bg-gray-200 text-gray-500' : ''}`}
                              >
                                {item.category.toUpperCase()}
                              </Badge>
                            </div>

                            <p className={`text-xs ${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.code}
                            </p>

                            {item.description && (
                              <p className={`text-sm ${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.description}
                              </p>
                            )}

                            <div className="space-y-1 text-sm">
                              {item.size_capacity && (
                                <p className={`${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
                                  📏 {item.size_capacity}
                                </p>
                              )}
                              
                              <p className={`${isAdded ? 'text-gray-400' : 'text-gray-600'}`}>
                                📦 Stok: {item.stock_quantity}
                              </p>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <p className={`font-bold text-lg ${isAdded ? 'text-gray-400' : 'text-green-600'}`}>
                                Rp {item.price_per_day.toLocaleString('id-ID')}/hari
                              </p>
                            </div>

                            {/* ✅ ADD BUTTON dengan conditional styling */}
                            <Button
                              onClick={() => addToBooking(item)}
                              disabled={isAdded || item.stock_quantity === 0}
                              className={`w-full mt-3 ${
                                isAdded 
                                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white' 
                                  : item.stock_quantity === 0
                                    ? 'bg-red-400 hover:bg-red-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Sudah Ditambahkan
                                </>
                              ) : item.stock_quantity === 0 ? (
                                'Stok Habis'
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Tambah ke Booking
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* ✅ BOTTOM ACTION */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {currentBookingItems.length > 0 ? (
                      <>✅ {currentBookingItems.length} equipment sudah dipilih untuk booking</>
                    ) : (
                      <>📋 Belum ada equipment yang dipilih</>
                    )}
                  </p>
                  
                  <div className="flex gap-3">
                    <Link to="/browse">
                      <Button variant="outline">
                        Kembali ke Browse
                      </Button>
                    </Link>
                    
                    <Link to="/booking/form">
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={currentBookingItems.length === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Lanjut ke Booking ({currentBookingItems.length})
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TambahEquipment