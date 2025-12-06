import { useState, useEffect } from "react";
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
import { Package } from "@/services/packageService";
import { API_BASE_URL } from "@/services/api";

interface Props {
  package: Package;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditPackageDialog = ({ package: pkg, open, onOpenChange, onSuccess }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    description: "",
    package_price: "",
    duration_days: "",
    package_stock: "",
    badge_text: "",
    badge_color: "",
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        capacity: pkg.capacity,
        description: pkg.description || "",
        package_price: pkg.price.toString(),
        duration_days: pkg.duration_days.toString(),
        package_stock: pkg.stock.total.toString(),
        badge_text: pkg.badge?.text || "",
        badge_color: pkg.badge?.color || "#FF9800",
      });
    }
  }, [pkg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/packages/update_package.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            package_id: pkg.package_id,
            ...formData,
            package_price: parseFloat(formData.package_price),
            duration_days: parseInt(formData.duration_days),
            package_stock: parseInt(formData.package_stock),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil!",
          description: "Paket berhasil diupdate",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(data.message || "Gagal update paket");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Paket: {pkg.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Paket *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                required
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
                required
              />
            </div>

            <div>
              <Label htmlFor="badge_text">Badge (Optional)</Label>
              <Input
                id="badge_text"
                value={formData.badge_text}
                onChange={(e) =>
                  setFormData({ ...formData, badge_text: e.target.value })
                }
              />
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
              rows={3}
            />
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
              {loading ? "Menyimpan..." : "Update Paket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackageDialog;