import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageCircle, Mail, Phone, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HelpSupport = () => {
  const navigate = useNavigate();

  const contactMethods = [
    { icon: MessageCircle, title: "Live Chat", description: "Chat with our support team", color: "text-primary" },
    { icon: Mail, title: "Email Support", description: "support@funbank.com", color: "text-secondary" },
    { icon: Phone, title: "Call Us", description: "+234 800 FUN BANK", color: "text-accent" },
  ];

  const faqs = [
    { question: "How do I send money?", category: "Transactions" },
    { question: "How to add a new card?", category: "Cards" },
    { question: "What are the transaction limits?", category: "Limits" },
    { question: "How do I reset my PIN?", category: "Security" },
    { question: "How to update my profile?", category: "Account" },
  ];

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3">
          {contactMethods.map((method, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${method.color}`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{method.title}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <button
                  key={index}
                  className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <p className="font-medium text-sm mb-1">{faq.question}</p>
                  <p className="text-xs text-muted-foreground">{faq.category}</p>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All FAQs
            </Button>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="shadow-glow border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">We'd love to hear from you!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your feedback to help us improve
            </p>
            <Button variant="gradient" className="w-full">
              Send Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpSupport;
