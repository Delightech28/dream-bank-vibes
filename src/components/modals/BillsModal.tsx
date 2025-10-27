import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Wifi, Smartphone, Tv, Droplet, Receipt } from "lucide-react";
import { useState } from "react";
import { BillsDetailModal } from "./BillsDetailModal";

interface BillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BillsModal = ({ open, onOpenChange }: BillsModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; label: string } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const billCategories = [
    { id: "airtime", label: "Airtime", icon: Smartphone, color: "text-green-500" },
    { id: "data", label: "Data", icon: Wifi, color: "text-blue-500" },
    { id: "electricity", label: "Electricity", icon: Zap, color: "text-yellow-500" },
    { id: "cable", label: "Cable TV", icon: Tv, color: "text-purple-500" },
    { id: "water", label: "Water", icon: Droplet, color: "text-cyan-500" },
    { id: "other", label: "Other Bills", icon: Receipt, color: "text-gray-500" },
  ];

  const handleCategoryClick = (category: { id: string; label: string }) => {
    setSelectedCategory(category);
    setShowDetailModal(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pay Bills</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {billCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted transition-all hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-full bg-muted flex items-center justify-center ${category.color}`}>
                <category.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium text-center">{category.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>

      <BillsDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        category={selectedCategory}
      />
    </Dialog>
  );
};
