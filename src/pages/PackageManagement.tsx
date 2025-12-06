import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Package as PackageIcon, Search, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/api";

interface Package {
  package_id: number;
  name: string;
  capacity: string;
  description: string;
  price: number;
  price_formatted: string;
  duration_days: number;
  badge?: { text: string; color: string };
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  stock: { total: number; reserved: number; available: number };
  images: { url: string | null; thumbnail: string | null };
  total_items: number;
}

// ✅ TAMBAH INTERFACE UNTUK ITEMS
interface PackageItem {
  item_name: string;
  quantity: number;
  display_order: number;
}

const PackageManagement = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    capacity_text: "",
    description: "",
    package_price: "",
    duration_days: "3",
    package_stock: "5",
    badge_text: "",
    badge_color: "#FF9800",
  });

  // ✅ TAMBAH STATE UNTUK ITEMS
  const [items, setItems] = useState<PackageItem[]>([
    { item_name: "", quantity: 1, display_order: 1 },
  ]);

  useEffect(() => {
    fetchPackages();
  }, [statusFilter]);

  // Populate form when editing
  useEffect(() => {
    if (editingPackage) {
      setFormData({
        name: editingPackage.name,
        capacity: editingPackage.capacity,
        capacity_text: "",
        description: editingPackage.description || "",
        package_price: editingPackage.price.toString(),
        duration_days: editingPackage.duration_days.toString(),
        package_stock: editingPackage.stock.total.toString(),
        badge_text: editingPackage.badge?.text || "",
        badge_color: editingPackage.badge?.color || "#FF9800",
      });
      // TODO: Fetch items untuk edit
      setItems([{ item_name: "", quantity: 1, display_order: 1 }]);
    }
  }, [editingPackage]);

  // ✅ TAMBAH FUNCTION UNTUK FETCH PACKAGE DETAIL (dengan items)
  const fetchPackageDetail = async (packageId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/get_package_detail.php?package_id=${packageId}`);
      const data = await response.json();
      
      console.log("📦 Package Detail:", data); // DEBUG
      
      if (data.success && data.data) {
        const pkg = data.data;
        
        // Set form data
        setFormData({
          name: pkg.name,
          capacity: pkg.capacity,
          capacity_text: pkg.capacity_text || "",
          description: pkg.description || "",
          package_price: pkg.price.toString(),
          duration_days: pkg.duration_days.toString(),
          package_stock: pkg.stock.total.toString(),
          badge_text: pkg.badge?.text || "",
          badge_color: pkg.badge?.color || "#FF9800",
        });
        
        // ✅ Set items (PENTING!)
        if (pkg.items && pkg.items.length > 0) {
          setItems(pkg.items.map((item: any, index: number) => ({
            item_name: item.name,
            quantity: item.quantity,
            display_order: index + 1
          })));
        } else {
          setItems([{ item_name: "", quantity: 1, display_order: 1 }]);
        }
      }
    } catch (error) {
      console.error("Error fetching package detail:", error);
      toast({
        title: "Error",
        description: "Gagal memuat detail paket",
        variant: "destructive",
      });
    }
  };

  // ✅ UPDATE useEffect untuk editing
  useEffect(() => {
    if (editingPackage) {
      // Fetch detail package dengan items
      fetchPackageDetail(editingPackage.package_id);
    }
  }, [editingPackage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const url = `${API_BASE_URL}/packages/get_packages.php?sort_by=display_order${statusFilter !== 'all' ? '&is_active=' + statusFilter : ''}${searchParam}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch packages');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPackages();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: "",
      capacity_text: "",
      description: "",
      package_price: "",
      duration_days: "3",
      package_stock: "5",
      badge_text: "",
      badge_color: "#FF9800",
    });
    // ✅ RESET ITEMS
    setItems([{ item_name: "", quantity: 1, display_order: 1 }]);
  };

  // ✅ FUNCTIONS UNTUK MANAGE ITEMS
  const handleAddItem = () => {
    setItems([
      ...items,
      { item_name: "", quantity: 1, display_order: items.length + 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof PackageItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: parseInt(value as string) || 1 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDASI ITEMS
    const validItems = items.filter((item) => item.item_name.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Minimal harus ada 1 item paket",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/packages/create_package.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          package_price: parseFloat(formData.package_price),
          duration_days: parseInt(formData.duration_days),
          package_stock: parseInt(formData.package_stock),
          is_active: 1,
          items: validItems.map((item, index) => ({
            item_name: item.item_name,
            quantity: item.quantity,
            display_order: index + 1,
          })), // ✅ KIRIM ITEMS KE API
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Berhasil!",
          description: "Paket berhasil ditambahkan",
        });
        setShowCreateDialog(false);
        resetForm();
        fetchPackages();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    // ✅ VALIDASI ITEMS
    const validItems = items.filter((item) => item.item_name.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Minimal harus ada 1 item paket",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/packages/update_package.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: editingPackage.package_id,
          ...formData,
          package_price: parseFloat(formData.package_price),
          duration_days: parseInt(formData.duration_days),
          package_stock: parseInt(formData.package_stock),
          items: validItems.map((item, index) => ({
            item_name: item.item_name,
            quantity: item.quantity,
            display_order: index + 1,
          })), // ✅ KIRIM ITEMS KE API
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Berhasil!",
          description: "Paket berhasil diupdate",
        });
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingPackage) return;

    try {
      const response = await fetch(`${API_BASE_URL}/packages/delete_package.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: deletingPackage.package_id,
          force_delete: 0
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Berhasil!",
          description: "Paket berhasil dihapus",
        });
        setDeletingPackage(null);
        fetchPackages();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (pkg: Package) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/update_package.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: pkg.package_id,
          is_active: pkg.is_active ? 0 : 1
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Paket ${pkg.is_active ? "dinonaktifkan" : "diaktifkan"}`,
        });
        fetchPackages();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-orange-600">
            Kelola Paket Rental
          </h1>
          <p className="text-gray-600 mt-1">
            Atur dan kelola paket rental equipment outdoor
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Paket
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Paket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{packages.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paket Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {packages.filter((p) => p.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {packages.reduce((sum, p) => sum + p.stock.total, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stok Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {packages.reduce((sum, p) => sum + p.stock.available, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama paket..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="1">Aktif</SelectItem>
                <SelectItem value="0">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paket</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>Harga/Hari</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Belum ada paket rental
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.package_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {pkg.images.thumbnail ? (
                        <img
                          src={pkg.images.thumbnail}
                          alt={pkg.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                          <PackageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{pkg.name}</p>
                        {pkg.badge && (
                          <Badge
                            className="mt-1 text-xs"
                            style={{ backgroundColor: pkg.badge.color }}
                          >
                            {pkg.badge.text}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{pkg.capacity}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-orange-600">
                      {pkg.price_formatted}
                    </span>
                  </TableCell>
                  <TableCell>{pkg.duration_days} hari</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">
                        {pkg.stock.available}/{pkg.stock.total}
                      </p>
                      {pkg.stock.reserved > 0 && (
                        <p className="text-xs text-gray-500">
                          ({pkg.stock.reserved} reserved)
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={pkg.is_active ? "default" : "secondary"}
                      className={pkg.is_active ? "bg-green-500" : ""}
                    >
                      {pkg.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPackage(pkg)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(pkg)}
                      >
                        {pkg.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeletingPackage(pkg)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ✅ CREATE DIALOG - DENGAN ITEMS */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Paket Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-6">
            {/* INFORMASI PAKET */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Informasi Paket</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nama Paket *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="PAKET KOMPLIT 4 ORANG"
                    required
                  />
                </div>
                <div>
                  <Label>Kapasitas *</Label>
                  <Input
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="4-5 Orang"
                    required
                  />
                </div>
                <div>
                  <Label>Harga/Hari *</Label>
                  <Input
                    type="number"
                    value={formData.package_price}
                    onChange={(e) => setFormData({...formData, package_price: e.target.value})}
                    placeholder="140000"
                    required
                  />
                </div>
                <div>
                  <Label>Durasi (hari) *</Label>
                  <Input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Stok *</Label>
                  <Input
                    type="number"
                    value={formData.package_stock}
                    onChange={(e) => setFormData({...formData, package_stock: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Badge (opsional)</Label>
                  <Input
                    value={formData.badge_text}
                    onChange={(e) => setFormData({...formData, badge_text: e.target.value})}
                    placeholder="PALING POPULER"
                  />
                </div>
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Deskripsi paket..."
                />
              </div>
            </div>

            {/* ✅ ITEM-ITEM PAKET */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Item-Item Paket *</h3>
                <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600 mb-1">Nama Item *</Label>
                      <Input
                        placeholder="Contoh: Tenda Kapasitas 6-8 Orang"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-gray-600 mb-1">Qty *</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
                <strong>Total:</strong> {items.filter((i) => i.item_name.trim()).length} item terisi
                {items.filter((i) => i.item_name.trim()).length === 0 && (
                  <span className="text-red-600 ml-2">⚠️ Minimal 1 item harus diisi</span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}>
                Batal
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Simpan Paket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ EDIT DIALOG - DENGAN ITEMS */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => {
        if (!open) {
          setEditingPackage(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Paket: {editingPackage?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* INFORMASI PAKET */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Informasi Paket</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nama Paket *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Kapasitas *</Label>
                  <Input
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Harga/Hari *</Label>
                  <Input
                    type="number"
                    value={formData.package_price}
                    onChange={(e) => setFormData({...formData, package_price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Durasi (hari) *</Label>
                  <Input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Stok *</Label>
                  <Input
                    type="number"
                    value={formData.package_stock}
                    onChange={(e) => setFormData({...formData, package_stock: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Badge (opsional)</Label>
                  <Input
                    value={formData.badge_text}
                    onChange={(e) => setFormData({...formData, badge_text: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            {/* ✅ ITEM-ITEM PAKET */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Item-Item Paket *</h3>
                <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600 mb-1">Nama Item *</Label>
                      <Input
                        placeholder="Contoh: Tenda Kapasitas 6-8 Orang"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-gray-600 mb-1">Qty *</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
                <strong>Total:</strong> {items.filter((i) => i.item_name.trim()).length} item terisi
                {items.filter((i) => i.item_name.trim()).length === 0 && (
                  <span className="text-red-600 ml-2">⚠️ Minimal 1 item harus diisi</span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditingPackage(null);
                resetForm();
              }}>
                Batal
              </Button>
              <Button type="submit">
                <Edit className="w-4 h-4 mr-2" />
                Update Paket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus paket "{deletingPackage?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageManagement;