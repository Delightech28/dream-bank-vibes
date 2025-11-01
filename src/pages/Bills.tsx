import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Smartphone, Wifi, Zap, Droplet, Tv, Phone } from "lucide-react";

const Bills = () => {
  const navigate = useNavigate();

  const billCategories = [
    { id: "airtime", label: "Airtime", icon: Smartphone, color: "text-blue-500" },
    { id: "data", label: "Data", icon: Wifi, color: "text-purple-500" },
    { id: "electricity", label: "Electricity", icon: Zap, color: "text-yellow-500" },
    { id: "water", label: "Water", icon: Droplet, color: "text-cyan-500" },
    { id: "cable", label: "Cable TV", icon: Tv, color: "text-red-500" },
    { id: "internet", label: "Internet", icon: Phone, color: "text-green-500" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/bills/${categoryId}`);
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Pay Bills</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="grid grid-cols-2 gap-4">
          {billCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <category.icon className={`w-8 h-8 ${category.color}`} />
                </div>
                <span className="font-medium text-center">{category.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bills;
