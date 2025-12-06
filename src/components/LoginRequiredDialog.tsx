import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

// ✅ Update props to match what Browse.tsx is passing
interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  onConfirm,
}: LoginRequiredDialogProps) {
  const navigate = useNavigate();

  const handleRegister = () => {
    onOpenChange(false);
    navigate("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Login Diperlukan
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Anda harus login terlebih dahulu untuk menambahkan item ke keranjang
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-6">
          <Button
            onClick={onConfirm}
            className="w-full h-12 text-base"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Login Sekarang
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}