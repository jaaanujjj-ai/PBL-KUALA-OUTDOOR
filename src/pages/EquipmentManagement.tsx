import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Search, 
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  RefreshCw,
  Loader2,
  X,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Weight,
  Ruler,
  BookOpen,
  Shield
} from "lucide-react";

// ✅ INTERFACE untuk equipment dengan images array
interface EquipmentImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

// ✅ INTERFACE untuk Usage Guide
interface UsageGuideStep {
  guide_id?: number;
  step_number: number;
  title: string;
  description: string;
  image_url?: string;
}

// ✅ INTERFACE untuk Rental Terms
interface RentalTerm {
  term_id?: number;
  category: string;
  term_text: string;
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
  primary_image?: string;
  usage_guide?: UsageGuideStep[];  // ✅ TAMBAH INI
  rental_terms?: RentalTerm[];     // ✅ TAMBAH INI
  created_at: string;
}

const EquipmentManagement = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ STATE UNTUK CODE VALIDATION
  const [codeValidation, setCodeValidation] = useState({
    isChecking: false,
    isDuplicate: false,
    message: ''
  });

  // ✅ IMAGE UPLOAD STATES
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ✅ STATE UNTUK TAB MODAL
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'guide' | 'terms'>('basic');
  
  // ✅ STATE UNTUK USAGE GUIDE & RENTAL TERMS
  const [usageGuideSteps, setUsageGuideSteps] = useState<UsageGuideStep[]>([]);
  const [rentalTerms, setRentalTerms] = useState<RentalTerm[]>([]);

  // ✅ REF UNTUK FILE INPUT
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "tenda",
    size_capacity: "",
    dimensions: "",
    weight: "",
    material: "",
    stock_quantity: "",
    price_per_day: "",
    condition: "baik"
  });

  useEffect(() => {
    fetchEquipments();
  }, []);

  // ✅ FETCH EQUIPMENTS FROM DATABASE
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Fetched equipments:', data);
      
      if (Array.isArray(data)) {
        setEquipments(data);
        setFilteredEquipments(data);
      } else {
        setEquipments([]);
        setFilteredEquipments([]);
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching equipment:', err);
      setError('Gagal memuat equipment: ' + err.message);
      setEquipments([]);
      setFilteredEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHECK CODE AVAILABILITY
  const checkCodeAvailability = useCallback(
    async (code: string, excludeId: number | null = null) => {
      if (!code || code.length < 3) {
        setCodeValidation({ isChecking: false, isDuplicate: false, message: '' });
        return;
      }

      setCodeValidation({ isChecking: true, isDuplicate: false, message: 'Mengecek ketersediaan kode...' });

      try {
        const url = excludeId 
          ? `http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php?check_code=${encodeURIComponent(code)}&exclude_id=${excludeId}`
          : `http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php?check_code=${encodeURIComponent(code)}`;
        
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
          let message = result.message;
          if (editingEquipment && !result.exists && code === editingEquipment.code) {
            message = 'Kode tidak berubah dari sebelumnya';
          }

          setCodeValidation({
            isChecking: false,
            isDuplicate: result.exists,
            message: message
          });
        } else {
          setCodeValidation({
            isChecking: false,
            isDuplicate: false,
            message: ''
          });
        }

      } catch (error) {
        console.error('Error checking code:', error);
        setCodeValidation({
          isChecking: false, 
          isDuplicate: false, 
          message: ''
        });
      }
    }, [editingEquipment]
  );

  // ✅ CLEAR FILE INPUT
  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ HANDLE IMAGE CHANGE WITH TYPE SAFETY
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    
    if (!fileList || fileList.length === 0) {
      return;
    }

    const filesArray = Array.from(fileList) as File[];
    const validFiles: File[] = [];
    let hasError = false;

    for (const file of filesArray) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`⚠️ File "${file.name}" terlalu besar. Ukuran maksimal 5MB`);
        hasError = true;
        continue;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert(`⚠️ File "${file.name}" format tidak didukung. Harus JPG, PNG, GIF, atau WEBP`);
        hasError = true;
        continue;
      }
      
      validFiles.push(file);
    }

    if (hasError) {
      clearFileInput();
      if (validFiles.length === 0) {
        return;
      }
    }

    // Reset previews before adding new ones
    setImagePreviews([]);
    setImageFiles(validFiles);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.onerror = () => {
        console.error(`Failed to read file: ${file.name}`);
        alert(`⚠️ Gagal membaca file "${file.name}"`);
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ UPLOAD IMAGES TO SERVER (returns array of image_ids)
  const uploadImages = async (equipmentId: number): Promise<boolean> => {
    if (!imageFiles.length) return true;

    try {
      setUploadingImage(true);
      
      const uploadFormData = new FormData();
      imageFiles.forEach((file) => {
        uploadFormData.append('images[]', file);
        console.log(`📎 Adding file:`, file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
      });
      uploadFormData.append('equipment_id', equipmentId.toString());
      uploadFormData.append('is_primary', 'true'); // First image will be primary

      console.log('📤 Uploading', imageFiles.length, 'image(s) for equipment_id:', equipmentId);

      const response = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/upload/multi_image.php', {
        method: 'POST',
        body: uploadFormData
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error(`Upload failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Result:', result);

      if (result.success) {
        console.log('✅ Upload successful:', result.images?.length || 0, 'images');
        return true;
      } else {
        throw new Error(result.message || 'Upload gagal');
      }

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ DELETE SINGLE IMAGE
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;

    try {
      const response = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/upload/multi_image.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Gambar berhasil dihapus!');
        // Refresh equipment data
        if (editingEquipment) {
          const updatedEquipment = await fetchSingleEquipment(editingEquipment.equipment_id);
          setEditingEquipment(updatedEquipment);
        }
        await fetchEquipments();
      } else {
        throw new Error(result.message || 'Gagal menghapus gambar');
      }
    } catch (err: any) {
      console.error('❌ Error deleting image:', err);
      alert('Error: ' + err.message);
    }
  };

  // ✅ FETCH SINGLE EQUIPMENT (untuk refresh setelah edit)
  const fetchSingleEquipment = async (equipmentId: number): Promise<Equipment> => {
    const response = await fetch(`http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php?id=${equipmentId}`);
    if (!response.ok) throw new Error('Failed to fetch equipment');
    return await response.json();
  };

  // ✅ DEBOUNCED CODE CHECK
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.code && formData.code.length >= 3) {
        const excludeId = editingEquipment ? editingEquipment.equipment_id : null;
        checkCodeAvailability(formData.code, excludeId);
      } else {
        setCodeValidation({ isChecking: false, isDuplicate: false, message: '' });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.code, editingEquipment, checkCodeAvailability]);

  // ✅ FILTER EQUIPMENTS
  useEffect(() => {
    let filtered = equipments;
    
    if (searchTerm) {
      filtered = filtered.filter(equipment => 
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(equipment => equipment.category === categoryFilter);
    }
    
    if (conditionFilter !== "all") {
      filtered = filtered.filter(equipment => equipment.condition === conditionFilter);
    }
    
    setFilteredEquipments(filtered);
  }, [equipments, searchTerm, categoryFilter, conditionFilter]);

  // ✅ HANDLE SUBMIT (Updated untuk multi_image.php)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started...');
    console.log('📋 Usage Guide Steps:', usageGuideSteps);
    console.log('📋 Rental Terms:', rentalTerms);
    
    // Validations
    if (codeValidation.isDuplicate) {
      alert('❌ Kode equipment sudah digunakan!');
      return;
    }

    if (!formData.name.trim() || !formData.code.trim()) {
      alert('❌ Nama dan kode equipment harus diisi!');
      return;
    }
    
    setLoading(true);

    try {
      // Prepare equipment data (tanpa image_url, karena pakai equipment_images table)
      const equipmentData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        category: formData.category,
        size_capacity: formData.size_capacity.trim(),
        dimensions: formData.dimensions.trim(),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        material: formData.material.trim(),
        stock_quantity: parseInt(formData.stock_quantity),
        price_per_day: parseFloat(formData.price_per_day),
        condition: formData.condition
      };

      console.log('📤 Sending equipment data:', equipmentData);

      const apiUrl = 'http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php';
      let response;
      let equipmentId: number;
      
      if (editingEquipment) {
        // UPDATE existing equipment
        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            equipment_id: editingEquipment.equipment_id,
            ...equipmentData
          })
        });
        equipmentId = editingEquipment.equipment_id;
      } else {
        // CREATE new equipment
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipmentData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Gagal menyimpan equipment');
        }
        
        equipmentId = result.equipment_id;
        console.log('✅ Equipment created with ID:', equipmentId);
      }

      // ✅ Upload images if new files selected
      if (imageFiles.length > 0) {
        console.log('🖼️ Uploading new images for equipment_id:', equipmentId);
        try {
          await uploadImages(equipmentId);
          console.log('✅ Images uploaded successfully');
        } catch (uploadError: any) {
          console.error('❌ Image upload failed:', uploadError);
          
          const proceed = confirm(
            `Equipment berhasil disimpan, tapi upload gambar gagal: ${uploadError.message}\n\n` +
            `Apakah Anda ingin melanjutkan tanpa gambar?`
          );
          
          if (!proceed) {
            setLoading(false);
            return;
          }
        }
      }

      // ✅ Save Usage Guide Steps
      if (usageGuideSteps.length > 0) {
        console.log('📖 Saving usage guide steps for equipment_id:', equipmentId);
        console.log('📖 Steps data:', JSON.stringify(usageGuideSteps, null, 2));
        try {
          const guideResponse = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/admin/usage_guide.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipment_id: equipmentId,
              steps: usageGuideSteps
            })
          });

          const guideResult = await guideResponse.json();
          console.log('📖 Usage guide response:', guideResult);

          if (!guideResponse.ok || !guideResult.success) {
            throw new Error(guideResult.message || 'Failed to save usage guide');
          }
          
          console.log('✅ Usage guide saved successfully');
        } catch (guideError: any) {
          console.error('❌ Usage guide save failed:', guideError);
          alert('⚠️ Equipment berhasil disimpan, tapi panduan penggunaan gagal disimpan: ' + guideError.message);
        }
      }

      // ✅ Save Rental Terms
      if (rentalTerms.length > 0) {
        console.log('📜 Saving rental terms for equipment_id:', equipmentId);
        console.log('📜 Terms data:', JSON.stringify(rentalTerms, null, 2));
        try {
          const termsResponse = await fetch('http://localhost/PBL-KELANA-OUTDOOR/api/admin/rental_terms.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipment_id: equipmentId,
              terms: rentalTerms
            })
          });

          const termsResult = await termsResponse.json();
          console.log('📜 Rental terms response:', termsResult);

          if (!termsResponse.ok || !termsResult.success) {
            throw new Error(termsResult.message || 'Failed to save rental terms');
          }
          
          console.log('✅ Rental terms saved successfully');
        } catch (termsError: any) {
          console.error('❌ Rental terms save failed:', termsError);
          alert('⚠️ Equipment berhasil disimpan, tapi ketentuan sewa gagal disimpan: ' + termsError.message);
        }
      }

      alert(editingEquipment ? '✅ Equipment berhasil diupdate!' : '✅ Equipment berhasil ditambahkan!');
      await fetchEquipments();
      resetForm();

    } catch (err: any) {
      console.error('❌ Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE DELETE
  const handleDelete = async (equipment: Equipment) => {
    if (!confirm(`Yakin ingin menghapus "${equipment.name}"?`)) return;

    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost/PBL-KELANA-OUTDOOR/api/admin/equipment.php?id=${equipment.equipment_id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Equipment dan semua gambarnya berhasil dihapus!');
        await fetchEquipments();
      } else {
        throw new Error(result.message || 'Gagal menghapus equipment');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE EDIT
  const handleEdit = (equipment: Equipment) => {
    console.log('✏️ Editing equipment:', equipment);
    
    setFormData({
      name: equipment.name || '',
      code: equipment.code || '',
      description: equipment.description || '',
      category: equipment.category || 'tenda',
      size_capacity: equipment.size_capacity || '',
      dimensions: equipment.dimensions || '',
      weight: equipment.weight ? equipment.weight.toString() : '',
      material: equipment.material || '',
      stock_quantity: equipment.stock_quantity ? equipment.stock_quantity.toString() : '',
      price_per_day: equipment.price_per_day ? equipment.price_per_day.toString() : '',
      condition: equipment.condition || 'baik'
    });
    
    // ✅ Load Usage Guide
    if (equipment.usage_guide && equipment.usage_guide.length > 0) {
      setUsageGuideSteps(equipment.usage_guide);
    } else {
      setUsageGuideSteps([]);
    }
    
    // ✅ Load Rental Terms
    if (equipment.rental_terms && equipment.rental_terms.length > 0) {
      setRentalTerms(equipment.rental_terms);
    } else {
      setRentalTerms([]);
    }
    
    setCodeValidation({ isChecking: false, isDuplicate: false, message: '' });
    setImageFiles([]);
    setImagePreviews([]);
    clearFileInput();
    setActiveModalTab('basic');
    
    setEditingEquipment(equipment);
    setShowAddModal(true);
  };

  // ✅ RESET FORM
  const resetForm = () => {
    console.log('🔄 Resetting form...');
    
    setFormData({
      name: "", code: "", description: "", category: "tenda",
      size_capacity: "", dimensions: "", weight: "", material: "",
      stock_quantity: "", price_per_day: "", condition: "baik"
    });
    
    setCodeValidation({ isChecking: false, isDuplicate: false, message: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setUsageGuideSteps([]);
    setRentalTerms([]);
    setActiveModalTab('basic');
    setShowAddModal(false);
    setEditingEquipment(null);
    clearFileInput();
  };

  // ✅ HELPER FUNCTIONS
  const getCodeInputStyle = () => {
    if (!formData.code || formData.code.length < 3) return '';
    if (codeValidation.isChecking) return 'border-yellow-400 bg-yellow-50';
    if (codeValidation.isDuplicate) return 'border-red-400 bg-red-50';
    return 'border-green-400 bg-green-50';
  };

  const getStockStatus = (equipment: Equipment) => {
    const available = equipment.available_stock || equipment.stock_quantity;
    if (available === 0) return { color: 'bg-red-500', text: 'Habis' };
    if (available <= 2) return { color: 'bg-yellow-500', text: 'Stok Rendah' };
    return { color: 'bg-green-500', text: 'Tersedia' };
  };

  const getConditionColor = (condition: string) => {
    switch(condition) {
      case 'baik': return 'bg-green-500';
      case 'rusak_ringan': return 'bg-yellow-500';
      case 'perbaikan': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = {
    total: equipments.length,
    available: equipments.filter(eq => (eq.available_stock || eq.stock_quantity) > 0).length,
    lowStock: equipments.filter(eq => {
      const available = eq.available_stock || eq.stock_quantity;
      return available <= 2 && available > 0;
    }).length,
    outOfStock: equipments.filter(eq => (eq.available_stock || eq.stock_quantity) === 0).length,
    totalValue: equipments.reduce((sum, eq) => sum + (eq.price_per_day * eq.stock_quantity), 0)
  };

  if (loading && equipments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat equipment dari database...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kelola Equipment</h1>
                <p className="text-gray-600">Manajemen stok dan inventory equipment</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Equipment
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchEquipments}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Database Connection Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <Button 
              onClick={fetchEquipments}
              size="sm"
              className="mt-2 bg-red-600 hover:bg-red-700"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Equipment</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-gray-600">Tersedia</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <div className="text-sm text-gray-600">Stok Rendah</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <div className="text-sm text-gray-600">Habis</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-purple-600">
                Rp {stats.totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Aset</div>
            </CardContent>
          </Card>
        </div>

        {/* FILTERS */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama, kode, atau kategori equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Semua Kategori</option>
                <option value="tenda">Tenda</option>
                <option value="tas">Tas Gunung</option>
                <option value="sleeping_bag">Sleeping Bag</option>
                <option value="kompor">Kompor</option>
                <option value="matras">Matras</option>
              </select>
              
              <select 
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Semua Kondisi</option>
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="perbaikan">Perbaikan</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ✅ EQUIPMENT GRID - DISPLAY PRIMARY IMAGE OR FIRST IMAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.map((equipment, index) => {
            const stockStatus = getStockStatus(equipment);
            const available = equipment.available_stock || equipment.stock_quantity;
            const reserved = equipment.reserved_stock || 0;
            const rented = equipment.rented_stock || 0;
            
            // ✅ Get primary image or first image from images array
            const displayImage = equipment.primary_image || 
                                (equipment.images && equipment.images.length > 0 ? equipment.images[0].image_url : null);
            
            return (
              <Card key={`${equipment.equipment_id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* IMAGE SECTION */}
                  {displayImage ? (
                    <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={displayImage}
                        alt={equipment.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        style={{ display: 'block' }}
                      />
                      
                      <div className="hidden absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 items-center justify-center">
                        <div className="text-center text-white p-4">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-70" />
                          <p className="text-sm opacity-70">Gambar tidak dapat dimuat</p>
                          <p className="text-xs opacity-50">{equipment.code}</p>
                        </div>
                      </div>
                      
                      {/* ✅ Badge jumlah gambar */}
                      {equipment.images && equipment.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{equipment.images.length} foto</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <span className="text-4xl font-bold block mb-2">
                          {equipment.name.charAt(0)}
                        </span>
                        <p className="text-sm opacity-70">Tidak ada gambar</p>
                        <p className="text-xs opacity-50 mt-1">{equipment.code}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* CONTENT SECTION */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                          {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{equipment.code}</p>
                        <Badge variant="outline" className="text-xs">
                          {equipment.category.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <Badge className={`${stockStatus.color} text-white text-xs text-center`}>
                          {stockStatus.text}
                        </Badge>
                        <Badge className={`${getConditionColor(equipment.condition)} text-white text-xs text-center`}>
                          {equipment.condition}
                        </Badge>
                      </div>
                    </div>

                    {equipment.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {equipment.description}
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium text-sm text-gray-800 mb-2">Spesifikasi</h4>
                      <div className="space-y-2 text-xs">
                        {equipment.size_capacity && (
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="flex justify-between w-full">
                              <span className="text-gray-600">Kapasitas:</span>
                              <span className="font-medium text-gray-900">{equipment.size_capacity}</span>
                            </div>
                          </div>
                        )}
                        
                        {equipment.dimensions && (
                          <div className="flex items-center gap-2">
                            <Ruler className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="flex justify-between w-full">
                              <span className="text-gray-600">Dimensi:</span>
                              <span className="font-medium text-gray-900">{equipment.dimensions}</span>
                            </div>
                          </div>
                        )}
                        
                        {equipment.weight && equipment.weight > 0 && (
                          <div className="flex items-center gap-2">
                            <Weight className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="flex justify-between w-full">
                              <span className="text-gray-600">Berat:</span>
                              <span className="font-medium text-gray-900">{equipment.weight} kg</span>
                            </div>
                          </div>
                        )}
                        
                        {equipment.material && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="flex justify-between w-full">
                              <span className="text-gray-600">Material:</span>
                              <span className="font-medium text-gray-900">{equipment.material}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="font-semibold text-green-600">{available}</div>
                          <div className="text-xs text-gray-600">Tersedia</div>
                        </div>
                        <div>
                          <div className="font-semibold text-yellow-600">{reserved}</div>
                          <div className="text-xs text-gray-600">Reserved</div>
                        </div>
                        <div>
                          <div className="font-semibold text-blue-600">{rented}</div>
                          <div className="text-xs text-gray-600">Disewa</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Stok:</span>
                          <span className="font-semibold text-gray-900">{equipment.stock_quantity} unit</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-green-600">
                        Rp {equipment.price_per_day.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-gray-600">per hari</div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(equipment)}
                        className="flex-1"
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(equipment)}
                        className="text-red-600 hover:text-red-700"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredEquipments.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada equipment ditemukan</p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Equipment Pertama
            </Button>
          </div>
        )}
      </div>

      {/* ✅ MODAL ADD/EDIT - WITH 3 TABS */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingEquipment ? 'Edit Equipment' : 'Tambah Equipment Baru'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* ✅ TAB NAVIGATION */}
              <div className="flex gap-2 mt-4 border-b">
                <button
                  onClick={() => setActiveModalTab('basic')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeModalTab === 'basic' 
                      ? 'border-b-2 border-green-600 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📦 Info Dasar
                </button>
                <button
                  onClick={() => setActiveModalTab('guide')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeModalTab === 'guide' 
                      ? 'border-b-2 border-green-600 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📖 Panduan Pakai
                </button>
                <button
                  onClick={() => setActiveModalTab('terms')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeModalTab === 'terms' 
                      ? 'border-b-2 border-green-600 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 Ketentuan Sewa
                </button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {/* ✅ TAB CONTENT: INFO DASAR */}
              {activeModalTab === 'basic' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ✅ IMAGE UPLOAD SECTION WITH EXISTING IMAGES */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-medium mb-4">📷 Gambar Equipment</h3>
                  
                  {/* ✅ EXISTING IMAGES (saat edit) */}
                  {editingEquipment && editingEquipment.images && editingEquipment.images.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-blue-700">
                        Gambar Saat Ini ({editingEquipment.images.length} foto)
                      </label>
                      <div className="flex gap-2 flex-wrap p-3 bg-blue-50 rounded-lg">
                        {editingEquipment.images.map((img) => (
                          <div key={img.image_id} className="relative w-24 h-24 group">
                            <img 
                              src={img.image_url} 
                              alt={`Equipment ${img.image_id}`} 
                              className="w-full h-full object-cover rounded border-2 border-blue-300" 
                            />
                            {img.is_primary && (
                              <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] px-1 rounded-br">
                                PRIMARY
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteImage(img.image_id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* NEW Image Preview */}
                    <div className="lg:w-1/3">
                      {imagePreviews.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-green-700">
                            Gambar Baru untuk Diupload
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {imagePreviews.map((src, idx) => (
                              <div key={idx} className="relative w-24 h-24">
                                <img 
                                  src={src} 
                                  alt={`Preview ${idx + 1}`} 
                                  className="w-full h-full object-cover rounded border-2 border-green-300" 
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                  onClick={() => {
                                    setImageFiles(files => files.filter((_, i) => i !== idx));
                                    setImagePreviews(previews => previews.filter((_, i) => i !== idx));
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Controls */}
                    <div className="lg:flex-1">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {editingEquipment ? 'Upload Gambar Tambahan' : 'Upload Gambar'}
                          </label>
                          <input
                             ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/gif,image/webp"
  multiple  
  onChange={handleImageChange}
  className="block w-full text-sm text-gray-500
             file:mr-4 file:py-2 file:px-4
             file:rounded-lg file:border-0
             file:text-sm file:font-medium
             file:bg-green-50 file:text-green-700
             hover:file:bg-green-100 cursor-pointer"
  disabled={uploadingImage}
                          />
                        </div>
                        
                        {imageFiles.length > 0 && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center text-green-800">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                {imageFiles.length} file siap diupload
                              </span>
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {imageFiles.map(file => `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join(', ')}
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">📋 Panduan Upload:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Format: JPG, PNG, GIF, WEBP</li>
                            <li>• Ukuran maksimal: 5MB per gambar</li>
                            <li>• Bisa upload multiple images sekaligus</li>
                            <li>• Gambar pertama akan menjadi gambar utama</li>
                            {editingEquipment && <li>• Gambar lama tetap tersimpan</li>}
                          </ul>
                        </div>
                        
                        {uploadingImage && (
                          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin mr-2 text-yellow-600" />
                            <span className="text-sm text-yellow-800">Mengupload gambar...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Equipment *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Tenda Dome 4 Orang"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Kode Equipment *</label>
                    <div className="relative">
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        placeholder="TENDA-001"
                        required
                        className={getCodeInputStyle()}
                      />
                      
                      {codeValidation.isChecking && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                        </div>
                      )}
                      
                      {formData.code && formData.code.length >= 3 && !codeValidation.isChecking && !codeValidation.isDuplicate && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      
                      {codeValidation.isDuplicate && (
                        <div className="absolute right-3 top-3">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    
                    {formData.code && formData.code.length >= 3 && codeValidation.message && (
                      <p className={`text-xs mt-1 ${
                        codeValidation.isDuplicate ? 'text-red-600' : 
                        codeValidation.isChecking ? 'text-yellow-600' : 
                        editingEquipment && formData.code === editingEquipment.code ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {codeValidation.isDuplicate ? '❌ ' : 
                         codeValidation.isChecking ? '⏳ ' : 
                         editingEquipment && formData.code === editingEquipment.code ? '📝 ' : '✅ '}
                        {codeValidation.message}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Format: KATEGORI-XXX (contoh: TENDA-001)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Deskripsi detail equipment..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Kategori *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="tenda">Tenda</option>
                      <option value="tas">Tas Gunung</option>
                      <option value="sleeping_bag">Sleeping Bag</option>
                      <option value="kompor">Kompor</option>
                      <option value="matras">Matras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kapasitas/Ukuran</label>
                    <Input
                      value={formData.size_capacity}
                      onChange={(e) => setFormData({...formData, size_capacity: e.target.value})}
                      placeholder="4-6 Orang / 60 Liter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kondisi *</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="baik">Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="perbaikan">Perbaikan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Dimensi</label>
                    <Input
                      value={formData.dimensions}
                      onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                      placeholder="300x250x180 cm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Berat (kg)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Material</label>
                    <Input
                      value={formData.material}
                      onChange={(e) => setFormData({...formData, material: e.target.value})}
                      placeholder="Nylon 210T"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Jumlah Stok *</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                      placeholder="5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Harga per Hari (Rp) *</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({...formData, price_per_day: e.target.value})}
                      placeholder="60000"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={loading || codeValidation.isDuplicate || codeValidation.isChecking || uploadingImage}
                  >
                    {(loading || uploadingImage) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {editingEquipment ? 'Update Equipment' : 'Tambah Equipment'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading || uploadingImage}
                  >
                    Batal
                  </Button>
                </div>
              </form>
              )}

              {/* ✅ TAB CONTENT: PANDUAN PAKAI */}
              {activeModalTab === 'guide' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Panduan Penggunaan Equipment</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setUsageGuideSteps([...usageGuideSteps, {
                          step_number: usageGuideSteps.length + 1,
                          title: '',
                          description: ''
                        }]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Step
                    </Button>
                  </div>

                  {usageGuideSteps.map((step, idx) => (
                    <Card key={idx} className="border-green-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-700">Step {idx + 1}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setUsageGuideSteps(usageGuideSteps.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Input
                          placeholder="Judul step (contoh: Persiapan Area)"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...usageGuideSteps];
                            updated[idx].title = e.target.value;
                            setUsageGuideSteps(updated);
                          }}
                        />
                        
                        <Textarea
                          placeholder="Deskripsi lengkap cara menggunakan..."
                          value={step.description}
                          rows={3}
                          onChange={(e) => {
                            const updated = [...usageGuideSteps];
                            updated[idx].description = e.target.value;
                            setUsageGuideSteps(updated);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}

                  {usageGuideSteps.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada panduan penggunaan</p>
                      <p className="text-sm text-gray-400 mt-1">Klik "Tambah Step" untuk mulai</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Simpan
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                  </div>
                </div>
              )}

              {/* ✅ TAB CONTENT: KETENTUAN SEWA */}
              {activeModalTab === 'terms' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Ketentuan Sewa Equipment</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setRentalTerms([...rentalTerms, {
                          category: 'Umum',
                          term_text: '',
                          display_order: rentalTerms.length
                        }]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Ketentuan
                    </Button>
                  </div>

                  {rentalTerms.map((term, idx) => (
                    <Card key={idx} className="border-blue-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <Input
                            placeholder="Kategori (contoh: Peminjaman, Pengembalian)"
                            value={term.category}
                            className="flex-1"
                            onChange={(e) => {
                              const updated = [...rentalTerms];
                              updated[idx].category = e.target.value;
                              setRentalTerms(updated);
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRentalTerms(rentalTerms.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Textarea
                          placeholder="Isi ketentuan..."
                          value={term.term_text}
                          rows={2}
                          onChange={(e) => {
                            const updated = [...rentalTerms];
                            updated[idx].term_text = e.target.value;
                            setRentalTerms(updated);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}

                  {rentalTerms.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada ketentuan sewa</p>
                      <p className="text-sm text-gray-400 mt-1">Klik "Tambah Ketentuan" untuk mulai</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Simpan
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;