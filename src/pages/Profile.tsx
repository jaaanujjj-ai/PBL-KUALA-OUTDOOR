import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Edit, Save, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost/PBL-KELANA-OUTDOOR/api";

interface Profile {
  full_name: string;
  identity_type: "NIK" | "KTP" | "SIM";
  identity_number: string;
  birth_date: string;
  gender: "Laki-laki" | "Perempuan" | null;
  phone: string;
  email: string;
  address: string;
  profile_picture: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    identity_type: "KTP",
    identity_number: "",
    birth_date: "",
    gender: null,
    phone: "",
    email: "",
    address: "",
    profile_picture: null,
  });
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [formKey, setFormKey] = useState(0); // ✅ TAMBAHKAN INI
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('🔍 DEBUG - authLoading:', authLoading);
  console.log('🔍 DEBUG - user:', user);
  console.log('🔍 DEBUG - isEditMode:', isEditMode);
  console.log('🔍 DEBUG - isProfileComplete:', isProfileComplete);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      console.log('⚠️ User tidak ada, redirect ke /auth');
      navigate("/auth");
    } else {
      console.log('✅ User ada, fetch profile');
      fetchProfile();
    }
  }, [user, navigate, authLoading]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/customer/profile.php?id=${user.id}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        const profileData: Profile = {
          full_name: data.full_name || "",
          identity_type: data.identity_type || "KTP",
          identity_number: data.identity_number || "",
          birth_date: data.birth_date || "",
          gender: data.gender || null,
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          profile_picture: data.profile_picture || null,
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
        if (data.profile_picture) setPreviewImage(data.profile_picture);

        const complete = !!(
          data.full_name &&
          data.identity_number &&
          data.birth_date &&
          data.gender &&
          data.phone &&
          data.email &&
          data.address
        );
        setIsProfileComplete(complete);

        if (!complete) {
          setIsEditMode(true);
        }
      } else {
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setIsEditMode(true);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file); // ✅ GANTI 'image' JADI 'file'
      formData.append('user_id', user?.id || ''); // ✅ GANTI 'customer_id' JADI 'user_id'

      // ✅ GUNAKAN ENDPOINT YANG BENAR
      const response = await fetch(`${API_BASE_URL}/upload-profile-picture.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      console.log('📤 Upload response:', result); // ✅ DEBUG LOG

      if (result.success) {
        return result.url; // ✅ GANTI 'image_url' JADI 'url'
      } else {
        throw new Error(result.error || 'Gagal upload gambar');
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast({
        title: "❌ Error upload gambar",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!profile.full_name.trim()) {
      toast({ title: "Error", description: "Nama Lengkap wajib diisi", variant: "destructive" });
      return;
    }
    if (!profile.phone.trim()) {
      toast({ title: "Error", description: "Nomor HP wajib diisi", variant: "destructive" });
      return;
    }
    if (!profile.identity_number.trim()) {
      toast({ title: "Error", description: "Nomor Identitas wajib diisi", variant: "destructive" });
      return;
    }
    if (!profile.birth_date) {
      toast({ title: "Error", description: "Tanggal Lahir wajib diisi", variant: "destructive" });
      return;
    }
    if (!profile.gender) {
      toast({ title: "Error", description: "Jenis Kelamin wajib diisi", variant: "destructive" });
      return;
    }
    if (!profile.address.trim()) {
      toast({ title: "Error", description: "Alamat wajib diisi", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = profile.profile_picture;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          throw new Error('Gagal upload gambar');
        }
      }

      const response = await fetch(`${API_BASE_URL}/customer/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          identity_type: profile.identity_type,
          identity_number: profile.identity_number,
          birth_date: profile.birth_date,
          gender: profile.gender,
          phone: profile.phone,
          address: profile.address,
          profile_picture: imageUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Berhasil",
          description: "Profil Anda telah disimpan",
        });
        setIsEditMode(false);
        setIsProfileComplete(true);
        setSelectedFile(null);
        await fetchProfile();
      } else {
        throw new Error(result.message || "Gagal menyimpan profil");
      }
    } catch (error: any) {
      toast({
        title: "❌ Error menyimpan profil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditMode) {
      toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah foto" });
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Ukuran maksimal 5MB", variant: "destructive" });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "File harus berupa gambar", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleEditClick = () => {
    console.log('🔄 Klik Edit - isEditMode sebelumnya:', isEditMode);
    setIsEditMode(true);
    setFormKey(prev => prev + 1); // ✅ FORCE RE-RENDER
    console.log('🔄 Klik Edit - isEditMode sekarang: true');
    toast({ 
      title: "✏️ Mode Edit Aktif", 
      description: "Sekarang Anda dapat mengubah profil",
      duration: 2000
    });
  };

  const handleCancelEdit = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      if (originalProfile.profile_picture) setPreviewImage(originalProfile.profile_picture);
    }
    setSelectedFile(null);
    setIsEditMode(false);
    setFormKey(prev => prev + 1); // ✅ FORCE RE-RENDER
    toast({ 
      title: "❌ Dibatalkan", 
      description: "Perubahan dibatalkan",
      duration: 2000
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">Profil Pribadi</h1>
            <p className="text-green-100 text-sm mt-1">
              {isEditMode ? "Lengkapi atau ubah profil Anda" : "Profil Anda telah tersimpan"}
            </p>
            <div className="mt-3 text-xs bg-white/20 px-3 py-1 rounded inline-block font-medium">
              Mode: {isEditMode ? "✏️ EDIT" : "👁️ VIEW"} | Complete: {isProfileComplete ? "✅ YA" : "⚠️ TIDAK"}
            </div>
          </div>

          <div className="p-8">
            {/* ✅ TAMBAHKAN KEY DI FORM */}
            <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
              {/* FOTO PROFIL */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-3">
                  <div className="w-36 h-36 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditMode && (
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-md border-4 border-white transition-all hover:scale-110"
                    >
                      <Camera className="w-6 h-6" />
                    </label>
                  )}
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-gray-500 text-sm text-center">
                  {isEditMode ? "📷 Klik ikon kamera untuk ubah foto (Max 5MB)" : "Foto profil Anda"}
                </p>
              </div>

              {/* NAMA LENGKAP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-4 py-3 transition-all ${
                    isEditMode 
                      ? "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900" 
                      : "bg-gray-100 border-gray-200 text-gray-600"
                  }`}
                  value={profile.full_name}
                  onChange={(e) => {
                    console.log('📝 Nama onChange:', e.target.value);
                    setProfile({ ...profile, full_name: e.target.value });
                  }}
                  onFocus={() => {
                    if (!isEditMode) {
                      toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                    }
                  }}
                  placeholder="Masukkan nama lengkap Anda"
                  readOnly={!isEditMode}
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`w-full border rounded-lg px-4 py-3 transition-all ${
                    isEditMode 
                      ? "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900" 
                      : "bg-gray-100 border-gray-200 text-gray-600"
                  }`}
                  value={profile.email}
                  onChange={(e) => {
                    console.log('📝 Email onChange:', e.target.value);
                    setProfile({ ...profile, email: e.target.value });
                  }}
                  onFocus={() => {
                    if (!isEditMode) {
                      toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                    }
                  }}
                  placeholder="email@example.com"
                  readOnly={!isEditMode}
                  required
                />
              </div>

              {/* JENIS IDENTITAS & NOMOR IDENTITAS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Identitas <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full border rounded-lg px-4 py-3 transition-all ${
                      isEditMode 
                        ? "bg-white border-gray-300 focus:border-green-500 text-gray-900" 
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                    value={profile.identity_type}
                    onChange={(e) => {
                      console.log('📝 Identity type onChange:', e.target.value);
                      setProfile({ ...profile, identity_type: e.target.value as "NIK" | "KTP" | "SIM" });
                    }}
                    onFocus={() => {
                      if (!isEditMode) {
                        toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                      }
                    }}
                    disabled={!isEditMode}
                  >
                    <option value="KTP">KTP</option>
                    <option value="NIK">NIK</option>
                    <option value="SIM">SIM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Identitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-lg px-4 py-3 transition-all ${
                      isEditMode 
                        ? "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900" 
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                    value={profile.identity_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const max = profile.identity_type === "SIM" ? 12 : 16;
                      console.log('📝 Identity number onChange:', value);
                      setProfile({ ...profile, identity_number: value.slice(0, max) });
                    }}
                    onFocus={() => {
                      if (!isEditMode) {
                        toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                      }
                    }}
                    placeholder={`Masukkan nomor ${profile.identity_type}`}
                    readOnly={!isEditMode}
                    required
                  />
                </div>
              </div>

              {/* TANGGAL LAHIR & JENIS KELAMIN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full border rounded-lg px-4 py-3 transition-all ${
                      isEditMode 
                        ? "bg-white border-gray-300 focus:border-green-500 text-gray-900" 
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                    value={profile.birth_date}
                    onChange={(e) => {
                      console.log('📝 Birth date onChange:', e.target.value);
                      setProfile({ ...profile, birth_date: e.target.value });
                    }}
                    onFocus={() => {
                      if (!isEditMode) {
                        toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                      }
                    }}
                    readOnly={!isEditMode}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full border rounded-lg px-4 py-3 transition-all ${
                      isEditMode 
                        ? "bg-white border-gray-300 focus:border-green-500 text-gray-900" 
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                    value={profile.gender || ""}
                    onChange={(e) => {
                      console.log('📝 Gender onChange:', e.target.value);
                      setProfile({ ...profile, gender: e.target.value as "Laki-laki" | "Perempuan" });
                    }}
                    onFocus={() => {
                      if (!isEditMode) {
                        toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                      }
                    }}
                    disabled={!isEditMode}
                    required
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* NOMOR HP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor HP/WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className={`w-full border rounded-lg px-4 py-3 transition-all ${
                    isEditMode 
                      ? "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900" 
                      : "bg-gray-100 border-gray-200 text-gray-600"
                  }`}
                  value={profile.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    console.log('📝 Phone onChange:', value);
                    setProfile({ ...profile, phone: value.slice(0, 13) });
                  }}
                  onFocus={() => {
                    if (!isEditMode) {
                      toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                    }
                  }}
                  placeholder="08xxxxxxxxxx"
                  readOnly={!isEditMode}
                  required
                />
              </div>

              {/* ALAMAT LENGKAP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full border rounded-lg px-4 py-3 transition-all ${
                    isEditMode 
                      ? "bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900" 
                        : "bg-gray-100 border-gray-200 text-gray-600"
                  }`}
                  rows={4}
                  value={profile.address}
                  onChange={(e) => {
                    console.log('📝 Address onChange:', e.target.value);
                    setProfile({ ...profile, address: e.target.value });
                  }}
                  onFocus={() => {
                    if (!isEditMode) {
                      toast({ title: "⚠️ Mode View", description: "Klik 'Edit Profil' untuk mengubah data" });
                    }
                  }}
                  placeholder="Masukkan alamat lengkap"
                  readOnly={!isEditMode}
                  required
                />
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex gap-3 pt-4">
                {!isEditMode && isProfileComplete ? (
                  <Button
                    type="button"
                    onClick={handleEditClick}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profil
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Simpan Profil
                        </>
                      )}
                    </Button>
                    {isProfileComplete && (
                      <Button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Batal
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* NOTIFIKASI */}
              {!isProfileComplete && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-yellow-800 font-medium">
                    Lengkapi profil untuk dapat melakukan booking
                  </p>
                </div>
              )}
              {isProfileComplete && !isEditMode && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm text-green-800 font-medium">
                    Profil lengkap! Klik "Edit Profil" untuk mengubah data.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;