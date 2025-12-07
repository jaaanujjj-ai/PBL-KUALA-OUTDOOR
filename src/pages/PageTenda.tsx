import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useContact } from "@/contexts/ContactContext";
import { 
  ArrowLeft, 
  Tent, 
  Users, 
  Shield, 
  Star,
  MessageCircle,
  Phone,
  CheckCircle
} from "lucide-react";

const TendaPage = () => {
  const { contactInfo } = useContact();
  
  // Sample data - nanti bisa diganti dengan API call
  const tendaItems = [
    {
      id: 1,
      name: "Tenda Dome 4 Orang",
      price: "35.000",
      period: "per hari",
      image: "/tenda-dome-4.jpg",
      capacity: "4 orang",
      features: ["Double Layer", "Waterproof", "Easy Setup"],
      available: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "Tenda Ultralight 2 Orang",
      price: "25.000",
      period: "per hari",
      image: "/tenda-ultralight-2.jpg",
      capacity: "2 orang",
      features: ["Ultralight", "Compact", "Windproof"],
      available: true,
      rating: 4.9
    },
    {
      id: 3,
      name: "Tenda Family 6 Orang",
      price: "50.000",
      period: "per hari",
      image: "/tenda-family-6.jpg",
      capacity: "6 orang",
      features: ["Spacious", "2 Rooms", "Strong Frame"],
      available: false,
      rating: 4.7
    },
    {
      id: 4,
      name: "Tenda Tunnel 3 Orang",
      price: "30.000",
      period: "per hari",
      image: "/tenda-tunnel-3.jpg",
      capacity: "3 orang",
      features: ["Tunnel Design", "Good Ventilation", "Lightweight"],
      available: true,
      rating: 4.6
    },
    {
      id: 5,
      name: "Fly Sheet & Tarp",
      price: "15.000",
      period: "per hari",
      image: "/flysheet-tarp.jpg",
      capacity: "Universal",
      features: ["Multipurpose", "Waterproof", "Large Coverage"],
      available: true,
      rating: 4.5
    },
    {
      id: 6,
      name: "Tenda Bivak 1 Orang",
      price: "20.000",
      period: "per hari",
      image: "/tenda-bivak-1.jpg",
      capacity: "1 orang",
      features: ["Ultra Compact", "Emergency Shelter", "Quick Setup"],
      available: true,
      rating: 4.4
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link to="/" className="flex items-center gap-2 text-green-200 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <span className="text-green-300">/</span>
            <span>Tenda & Shelter</span>
          </div>
          
          {/* Page Header */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tent className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🏕️ Tenda & Shelter</h1>
            <p className="text-xl text-green-100 mb-6">
              Koleksi tenda berkualitas untuk camping, pendakian, dan petualangan outdoor Anda
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                ✅ Semua Kondisi Prima
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                🛡️ Waterproof Guarantee
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                📞 Konsultasi Gratis
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tendaItems.map((item) => (
              <Card key={item.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Tent className="h-16 w-16 text-green-600" />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm">
                        Sedang Disewa
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  {/* Product Info */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                  
                  {/* Capacity */}
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Kapasitas: {item.capacity}</span>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-green-600">Rp {item.price}</span>
                    <span className="text-gray-500 text-sm">/{item.period}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <a 
                      href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo%20Kuala%20Outdoor!%20Saya%20ingin%20rental%20${item.name}%20dengan%20harga%20Rp%20${item.price}%20per%20hari.%20Apakah%20masih%20tersedia?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button 
                        className={`w-full ${item.available 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!item.available}
                      >
                        {item.available ? (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Pesan via WhatsApp
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Sedang Disewa
                          </>
                        )}
                      </Button>
                    </a>
                    
                    <a 
                      href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo%20Kuala%20Outdoor!%20Saya%20ingin%20konsultasi%20tentang%20tenda%20yang%20cocok%20untuk%20kebutuhan%20saya.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Tanya Detail & Stok
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">💡 Tips Memilih Tenda yang Tepat</h2>
            <p className="text-gray-600">Panduan singkat untuk memilih tenda sesuai kebutuhan petualangan Anda</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Pilih Sesuai Jumlah Orang</h3>
                  <p className="text-sm text-gray-600">Tambahkan 1 orang dari kapasitas untuk kenyamanan ekstra</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Perhatikan Musim & Cuaca</h3>
                  <p className="text-sm text-gray-600">Pilih tenda 4 season untuk cuaca ekstrem</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Cek Bobot & Ukuran</h3>
                  <p className="text-sm text-gray-600">Untuk hiking, pilih tenda yang ringan dan compact</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Setup & Breakdown</h3>
                  <p className="text-sm text-gray-600">Pilih tenda yang mudah dipasang, terutama untuk pemula</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Ventilasi & Kondensasi</h3>
                  <p className="text-sm text-gray-600">Pastikan tenda memiliki ventilasi yang baik</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Durability & Materials</h3>
                  <p className="text-sm text-gray-600">Cek denier fabric dan kualitas poles/rangka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">🏕️ Masih Bingung Pilih Tenda?</h2>
          <p className="text-xl mb-8 opacity-90">
            Tim berpengalaman kami siap membantu memilih tenda yang tepat untuk petualangan Anda!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo%20Kuala%20Outdoor!%20Saya%20ingin%20konsultasi%20untuk%20memilih%20tenda%20yang%20cocok%20untuk%20kebutuhan%20saya.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3">
                💬 Konsultasi Gratis
              </Button>
            </a>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3">
                🎒 Lihat Semua Equipment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TendaPage;