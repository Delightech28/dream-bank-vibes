import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useState } from "react";

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
}

interface ContactSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (contact: Contact) => void;
}

export const ContactSelectModal = ({ open, onOpenChange, onSelectContact }: ContactSelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const contacts: Contact[] = [
    { id: 1, name: "Mom", phone: "+234 800 123 4567", avatar: "👩" },
    { id: 2, name: "John Doe", phone: "+234 800 234 5678", avatar: "👨" },
    { id: 3, name: "Sarah Williams", phone: "+234 800 345 6789", avatar: "👩‍💼" },
    { id: 4, name: "David Brown", phone: "+234 800 456 7890", avatar: "👨‍💼" },
    { id: 5, name: "Emma Johnson", phone: "+234 800 567 8901", avatar: "👩‍🦰" },
  ];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Contact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {contact.avatar}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
