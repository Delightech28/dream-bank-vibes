import { Home, Receipt, CreditCard, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Receipt, label: "Activity", path: "/transactions" },
    { icon: CreditCard, label: "Cards", path: "/cards" },
    { icon: User, label: "Me", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 md:hidden z-50 shadow-2xl">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive
                  ? "nav-item-active"
                  : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative transition-all duration-300 ${
                  isActive ? "scale-110" : "scale-100"
                }`}>
                  <div className={`p-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? "bg-primary shadow-glow" 
                      : "bg-transparent"
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-muted-foreground"
                    }`} />
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                  isActive ? "text-primary scale-105" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
