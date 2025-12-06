import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone,
  MapPin,
  Clock,
  Instagram,
  MessageCircle,
  Tent,
  Mail,
} from "lucide-react";
import { useContact } from "@/contexts/ContactContext";

export const Footer = () => {
  const { contactInfo } = useContact();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* BRAND INFO */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Tent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">KUALA OUTDOOR</h3>
                <p className="text-green-400 text-sm">Rental Equipment</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Solusi terpercaya untuk semua kebutuhan peralatan outdoor Anda. 
              Melayani rental equipment camping dan pendakian dengan kualitas terbaik.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  Browse Equipment
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  Paket Rental
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  Open Trip
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  Keranjang
                </Link>
              </li>
            </ul>
          </div>

          {/* KONTAK KAMI - DINAMIS DARI CONTEXT */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak Kami</h4>
            <div className="space-y-3 text-sm">
              {/* Nomor 1 */}
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-400" />
                <a
                  href={`tel:${contactInfo.phone1}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {contactInfo.phone1}
                </a>
              </div>

              {/* Nomor 2 */}
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-400" />
                <a
                  href={`tel:${contactInfo.phone2}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {contactInfo.phone2}
                </a>
              </div>

              {/* Alamat */}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-400 mt-0.5" />
                <div className="text-gray-400">
                  {contactInfo.address.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-pink-400" />
                <span className="text-gray-400">{contactInfo.instagram}</span>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">Melayani 24 Jam</span>
              </div>
            </div>
          </div>

          {/* SOSIAL & CTA */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
            <div className="space-y-3">

              {/* Instagram Link */}
              <a
                href={`https://instagram.com/${contactInfo.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-pink-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm">{contactInfo.instagram}</span>
              </a>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, "")}?text=Halo%20Kuala%20Outdoor!%20Saya%20ingin%20bertanya%20tentang%20layanan%20rental%20equipment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm font-medium">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat WhatsApp
                </Button>
              </a>

              {/* Email */}
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">kualaoutdoor@gmail.com</span>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  1,504 Followers<br />
                  395 Posts<br />
                  Travel Service
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2024 Kuala Outdoor. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <Link to="/about" className="hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <a
                href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, "")}?text=Halo,%20saya%20butuh%20bantuan`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Bantuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};