import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Phone, MapPin, Clock, Users, Camera, Mountain, Tent } from 'lucide-react'
import { useContact } from '@/contexts/ContactContext'

const About = () => {
  const { contactInfo } = useContact();
  
  return (
  <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-8">
      {/* ✅ BACK TO HOME BUTTON */}
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Home
        </Button>
      </Link>

      {/* ✅ HEADER SECTION */}
      <div className="text-center mb-12">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tent className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">KUALA OUTDOOR</h1>
          <p className="text-xl text-green-600 font-semibold mb-4">PENYEWAAN ALAT CAMPING & PENDAKIAN</p>
          <p className="text-gray-600">Jl. K.H. ABDURRAHMAN WAHID, KUALA DUA, GG JAMBU, NO 78</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
            <Camera className="h-4 w-4 mr-2" />
            395 posts
          </Badge>
          <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
            <Users className="h-4 w-4 mr-2" />
            1,504 followers
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
            <Mountain className="h-4 w-4 mr-2" />
            Travel Service
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ✅ ABOUT US CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-6 w-6 text-green-600" />
                Tentang Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                <strong>Kuala Outdoor</strong> adalah platform penyewaan peralatan outdoor terpercaya 
                yang telah melayani para petualang dan pecinta alam di Indonesia.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Kami menyediakan berbagai peralatan berkualitas tinggi untuk mendukung petualangan Anda, 
                mulai dari <strong>mendaki gunung, camping, hingga aktivitas outdoor lainnya</strong>.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">🎯 Misi Kami:</p>
                <p className="text-green-700 text-sm mt-1">
                  Membuat petualangan outdoor lebih mudah diakses dengan equipment berkualitas dan layanan terbaik.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ✅ CONTACT INFO CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-blue-600" />
                Kontak & Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Melayani 24 Jam</p>
                    <p className="text-sm text-gray-600">(Fast Response)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Telepon:</p>
                    <div className="space-y-1">
                      <a href="tel:+6281258599058" className="text-blue-600 hover:underline block">
                        📞 +62 812-5859-9058
                      </a>
                      <a href="tel:082253446316" className="text-blue-600 hover:underline block">
                        📞 082253446316
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Alamat:</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Jl. K.H. Abdurrahman Wahid<br />
                      Kuala Dua, Gg Jambu, No 78<br />
                      Kab. Kubu Raya
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <a 
                  href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo Kuala Outdoor, saya ingin bertanya tentang rental equipment`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    💬 Chat WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ SERVICES SECTION */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">🎒 Layanan Kami</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Open Trip</h3>
                <p className="text-gray-600 text-sm">Petualangan bersama ke destinasi menakjubkan</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Tent className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Camping Ceria</h3>
                <p className="text-gray-600 text-sm">Equipment lengkap untuk camping yang nyaman</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Nature Experience</h3>
                <p className="text-gray-600 text-sm">Menghadirkan pengalaman alam yang tak terlupakan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ TERMS & CONDITIONS */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Syarat & Ketentuan Sewa Peralatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p>Penyewa wajib menggunakan Kartu Identitas (ID Card) asli dan masih berlaku sesuai dengan nama penyewa sebagai jaminan.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p>Penyewaan kami buka 24 jam (Layanan Fast Response), disarankan untuk melakukan perjanjian terlebih dahulu sebelum melakukan pengambilan.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p>Pembayaran sewa wajib lunas pada waktu pengambilan barang.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p>Biaya sewa dihitung per 24 jam dimulai dari tanggal dan jam pengambilan barang.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <p>Barang yang disewa sebaiknya diperiksa dahulu sebelum meninggalkan tempat penyewaan kami.</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                    <p>Jika dalam waktu 3x24 jam setelah batas waktu pengambilan pihak penyewa tidak mengembalikan barang, akan dilaporkan kepada pihak yang berwajib.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">7</span>
                    <p>Keterlambatan dalam pengembalian barang, akan dikenakan sanksi denda sebesar biaya sewa per harinya dan berlaku kelipatan.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">8</span>
                    <p>Segala jenis kerusakan atau kehilangan peralatan yang telah disewa merupakan tanggung jawab penyewa dan wajib mengganti barang atau biaya penggantian.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">9</span>
                    <p>Dilarang keras merokok dalam tenda.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ BOTTOM CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎒 Siap Memulai Petualangan?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Dengan pengalaman bertahun-tahun dan ribuan customer yang puas, 
                kami siap mendukung petualangan outdoor Anda!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/browse">
                  <Button className="bg-green-600 hover:bg-green-700">
                    🎒 Browse Equipment
                  </Button>
                </Link>
                
                <a 
                  href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo Kuala Outdoor, saya ingin konsultasi tentang equipment outdoor`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100">
                    💬 Konsultasi Gratis
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
  )
}

export default About