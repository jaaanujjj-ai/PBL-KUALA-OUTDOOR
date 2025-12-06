import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";

interface BookingSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: string | number;
  bookingCode?: string;
  onWhatsAppClick?: () => void; // ✅ TAMBAHKAN INI
}

export function BookingSuccessDialog({
  open,
  onOpenChange,
  bookingId,
  bookingCode,
  onWhatsAppClick, // ✅ TAMBAHKAN INI
}: BookingSuccessDialogProps) {
  const navigate = useNavigate();

  // ✅ TAMBAHKAN HANDLER INI
  const handleWhatsApp = () => {
    if (onWhatsAppClick) {
      onWhatsAppClick(); // Jalankan handleWhatsApp dari parent
    }
    onOpenChange(false);
  };

  const handleBackToHome = () => {
    onOpenChange(false);
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Booking Berhasil Dibuat!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Pesanan Anda telah berhasil dibuat dan sedang menunggu konfirmasi
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kode Booking:</span>
              <span className="font-bold text-green-700 text-lg font-mono">
                {bookingCode || "-"}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📱{" "}
              <strong>
                Kirim konfirmasi via WhatsApp
              </strong>{" "}
              untuk memastikan ketersediaan dan detail pembayaran
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-center sm:justify-center">
          <Button
            onClick={handleWhatsApp}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 h-12"
            size="lg"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Kirim ke WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}