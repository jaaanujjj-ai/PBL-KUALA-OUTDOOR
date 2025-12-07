import { useState, useEffect } from 'react';
import { useContact } from '@/contexts/ContactContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Phone, MapPin, Instagram } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ContactManagement = () => {
  const { contactInfo, updateContactInfo } = useContact();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    phone1: '',
    phone2: '',
    instagram: '',
    address: ''
  });

  useEffect(() => {
    setFormData(contactInfo);
  }, [contactInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactInfo(formData);
    alert('✅ Informasi kontak berhasil diperbarui!');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ TAMBAHKAN LOADING STATE
  if (!contactInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
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
               <Link to="/admin/dashboard">
                 <Button variant="outline" size="sm">
                   <ArrowLeft className="h-4 w-4 mr-2" />
                   Dashboard
                 </Button>
               </Link>
             </div>
           </div>
         </div>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nomor Telepon 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="phone1" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor Telepon 1 (Primary)
                    </Label>
                    <Input
                      id="phone1"
                      value={formData.phone1}
                      onChange={(e) => handleChange('phone1', e.target.value)}
                      placeholder="Contoh: 089692854470"
                      required
                    />
                  </div>

                  {/* Nomor Telepon 2 */}
                  <div className="space-y-2">
                    <Label htmlFor="phone2" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor Telepon 2 (Secondary)
                    </Label>
                    <Input
                      id="phone2"
                      value={formData.phone2}
                      onChange={(e) => handleChange('phone2', e.target.value)}
                      placeholder="Contoh: 082253446316"
                      required
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Username Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      placeholder="Contoh: @kuala_outdoor"
                      required
                    />
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Alamat Lengkap
                    </Label>
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Masukkan alamat lengkap..."
                      className="w-full border rounded-lg px-3 py-2 min-h-[100px] resize-y focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Preview Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900 text-white p-4 rounded-lg text-sm">
                  <h4 className="font-semibold mb-3">Kontak Kami</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-green-400" />
                      <a href={`tel:${formData.phone1}`} className="text-gray-400 hover:text-white transition-colors">
                        {formData.phone1}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-green-400" />
                      <a href={`tel:${formData.phone2}`} className="text-gray-400 hover:text-white transition-colors">
                        {formData.phone2}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 text-red-400 mt-1" />
                      <div className="text-gray-300">
                        {formData.address.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Instagram className="h-3 w-3 text-pink-400" />
                      <span className="text-gray-300">{formData.instagram}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-2">
                  <p>ℹ️ Perubahan akan langsung terlihat di:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Footer website</li>
                    <li>Halaman booking</li>
                    <li>Tombol WhatsApp</li>
                    <li>Dan semua halaman lainnya</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default ContactManagement;