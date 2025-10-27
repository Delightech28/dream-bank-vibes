import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Camera, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(1990, 0, 15));

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Personal Information</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log("Selected file:", file);
                }
              }}
            />
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" defaultValue="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xl">🇳🇬</span>
                  <span className="text-sm text-muted-foreground">+234</span>
                </div>
                <Input 
                  id="phone" 
                  type="tel" 
                  defaultValue="800 123 4567" 
                  className="pl-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dob"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={(date) => date && setDateOfBirth(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Victoria Island, Lagos" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bvn">BVN</Label>
              <Input id="bvn" defaultValue="221*****789" disabled />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" variant="gradient" size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfo;
