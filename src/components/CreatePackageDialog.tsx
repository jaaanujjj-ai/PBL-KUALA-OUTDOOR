import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/services/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PackageItem {
  name: string;
  quantity: number;
  display_order: number;
}

const CreatePackageDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
    is_popular: 0,
    is_active: 1,
  });

  const [items, setItems] = useState<PackageItem[]>([
    { name: "", quantity: 1, display_order: 1 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", quantity: 1, display_order: items.length + 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PackageItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate items
      const validItems = items.filter((item) => item.name.trim() !== "");
      if (validItems.length === 0) {
        throw new Error("Minimal harus ada 1 item paket");
      }

      const response = await fetch(
        `${API_BASE_URL}/packages/create_package.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            package_price: parseFloat(formData.package_price),
            duration_days: parseInt(formData.duration_days),
            package_stock: parseInt(formData.package_stock),
            items: validItems.map((item, index) => ({
              name: item.name,
              quantity: item.quantity,
              display_order: index + 1,
            })),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil!",
          description: "Paket berhasil dibuat",
        });
        onSuccess();
        onOpenChange(false);
        // Reset form
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
          is_popular: 0,
          is_active: 1,
        });
        setItems([{ name: "", quantity: 1, display_order: 1 }]);
      } else {
        throw new Error(data.message || "Gagal membuat paket");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Paket Rental Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INFORMASI DASAR */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Paket *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="PAKET KOMPLIT 4 ORANG"
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacity">Kapasitas *</Label>
                <Input
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="4-5 Orang"
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacity_text">Teks Kapasitas (Opsional)</Label>
                <Input
                  id="capacity_text"
                  value={formData.capacity_text}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity_text: e.target.value })
                  }
                  placeholder="Maksimal 5 orang"
                />
              </div>

              <div>
                <Label htmlFor="package_price">Harga per Hari *</Label>
                <Input
                  id="package_price"
                  type="number"
                  value={formData.package_price}
                  onChange={(e) =>
                    setFormData({ ...formData, package_price: e.target.value })
                  }
                  placeholder="140000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration_days">Durasi (hari) *</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_days: e.target.value })
                  }
                  placeholder="3"
                  required
                />
              </div>

              <div>
                <Label htmlFor="package_stock">Stok *</Label>
                <Input
                  id="package_stock"
                  type="number"
                  value={formData.package_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, package_stock: e.target.value })
                  }
                  placeholder="5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="badge_text">Badge (Opsional)</Label>
                <Input
                  id="badge_text"
                  value={formData.badge_text}
                  onChange={(e) =>
                    setFormData({ ...formData, badge_text: e.target.value })
                  }
                  placeholder="PALING POPULER"
                />
              </div>

              <div>
                <Label htmlFor="badge_color">Warna Badge</Label>
                <div className="flex gap-2">
                  <Input
                    id="badge_color"
                    type="color"
                    value={formData.badge_color}
                    onChange={(e) =>
                      setFormData({ ...formData, badge_color: e.target.value })
                    }
                    className="w-20"
                  />
                  <Input
                    value={formData.badge_color}
                    onChange={(e) =>
                      setFormData({ ...formData, badge_color: e.target.value })
                    }
                    placeholder="#FF9800"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Deskripsi paket..."
                rows={3}
              />
            </div>
          </div>

          {/* ITEM PAKET */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Item Paket *</h3>
              <Button type="button" onClick={handleAddItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Nama item (contoh: Tenda Kapasitas 4-5 Orang)"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
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
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Total: {items.filter((i) => i.name.trim()).length} item
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Paket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageDialog;