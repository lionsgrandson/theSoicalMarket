"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { X, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient"; 
import {  usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/useAuthStore";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Brands", href: "/brands" },
  { name: "Influencers", href: "/microinfluencers" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "Privacy", href: "/privacy" },
];

interface UserData {
  id: number;
  user: { email: string; first_name: string; last_name: string };
  signed_up_as: "influencer" | "brand";
  influencer_profile?: { profile_picture?: string; display_name?: string };
  brand_profile?: { logo?: string; display_name?: string };
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token, user: userData, logout: storeLogout } = useAuthStore();
  const pathName = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  console.log("session data",session);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Clear Zustand/localStorage first via Store
      storeLogout();
      
      // 2. Then sign out from NextAuth
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  const getDashboardLink = () => {
    if (!userData) return "/";
    const role = (userData as any).signed_up_as || (userData as any).user?.signed_up_as;
    return role === "influencer"
      ? "/influencer-dashboard"
      : "/brand-dashboard";
  };

  const getProfilePic = () => {
    const role = (userData as any).signed_up_as || (userData as any).user?.signed_up_as;
    if (role === "influencer") {
      return (userData as any).influencer_profile?.profile_picture || (userData as any).user?.influencer_profile?.profile_picture || null;
    }
    return (userData as any).brand_profile?.logo || (userData as any).user?.brand_profile?.logo || null;
  };

  const getDisplayName = () => {
    if (!userData) return "User";
    const role = (userData as any).signed_up_as || (userData as any).user?.signed_up_as;
    if (role === "influencer") {
      return (userData as any).influencer_profile?.display_name || (userData as any).user?.first_name || (userData as any).first_name || "Influencer";
    }
    return (userData as any).brand_profile?.business_name || (userData as any).brand_profile?.display_name || (userData as any).user?.first_name || (userData as any).first_name || "Brand";
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
console.log("Header mounted");

  // Desktop Auth Section
  const DesktopAuthSection = () => {
    // Prevent hydration mismatch by not rendering auth section until mounted
    if (!isMounted || sessionStatus === "loading") {
      return <Loader2 className="h-5 w-5 animate-spin text-white" />;
    }

    if (!token || !userData) {
      return (
        <Link href="/auth">
          <Button
            variant="default"
            size="sm"
            className={cn(
              "bg-primary cursor-pointer text-secondary border-secondary border hover:bg-background px-6 py-4",
              "transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            )}
          >
            Login
          </Button>
        </Link>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
  <button className="focus:outline-none">
    <div className="w-12 h-12 rounded-full ring-2 ring-gray-200 bg-white flex items-center justify-center overflow-hidden">
      {getProfilePic() ? (
        <Image
          src={getProfilePic()!}
          alt={getDisplayName()}
          width={48}
          height={48}
          className={`w-full h-full transition-all ${
            (userData as any)?.signed_up_as === "brand" || (userData as any)?.user?.signed_up_as === "brand"
              ? "object-contain"
              : "object-cover"
          }`}
          priority
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-semibold uppercase">
          {getDisplayName().charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  </button>
</DropdownMenuTrigger>


        <DropdownMenuContent align="end" className="w-56 mt-2">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground">{(userData as any).user?.email || (userData as any).email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()} className="flex items-center cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Mobile Auth Section
  const MobileAuthSection = () => {
    if (!isMounted || sessionStatus === "loading") return null;

    if (!token || !userData) {
      return (
        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
          <Button
            variant="default"
            size="lg"
            className={cn(
              "bg-primary text-primary-foreground hover:bg-accent",
              "transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl px-8 py-3 text-lg"
            )}
          >
            Login
          </Button>
        </Link>
      );
    }

    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4 px-6">
          <Avatar className="h-12 w-12 cursor-pointer rounded-full overflow-hidden border-white border-[1px]">
  <AvatarImage
    src={getProfilePic() || undefined}
    alt={getDisplayName()}
    className="h-full w-full object-cover"
  />
  <AvatarFallback className="bg-primary text-white font-semibold">
    {getDisplayName().charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>

          <div>
            <p className="text-lg font-semibold text-primary">{getDisplayName()}</p>
            <p className="text-sm text-primary">{(userData as any).user?.email || (userData as any).email}</p>
          </div>
        </div>

        <div className="space-y-4 px-6">
          <Link
            href={getDashboardLink()}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center text-primary hover:text-accent text-lg"
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center text-primary hover:text-red-400 text-lg w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    );
  };

  

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 pt-6">
        <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-8 bg-primary backdrop-blur rounded-md">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href={"/"}>
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image priority width={160} height={45} alt="social market" src={"/images/logo.png"} />
                </motion.div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:gap-4">
              {navigationLinks.map((link, index) =>{ 
                const isActive = pathName === link.href;

              return(
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                  
                    href={link.href}
                    className={cn(
                      "relative text-sm font-medium text-navlink-primary transition-colors duration-300",
                      "hover:text-[#F6FBFF] hover:bg-[#002140] hover:border-[#F7FBFF] hover:border hover:scale-105 transform rounded-md px-2 py-1 block",
                      isActive
      ? "bg-[#002140] text-[#F6FBFF] border border-[#F7FBFF]" 
      : "border border-transparent"
                    )}
                  >
                    {link.name}
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              )})}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex md:items-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <DesktopAuthSection />
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMobileMenu}
                className={cn(
                  "relative z-50 flex h-10 w-10 items-center justify-center rounded-md text-accent transition-colors",
                  "hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="flex h-5 w-5 flex-col items-center justify-center" animate={isMobileMenuOpen ? "open" : "closed"}>
                  <motion.span className="absolute h-0.5 w-5 bg-current" variants={{ closed: { rotate: 0, y: -6 }, open: { rotate: 45, y: 0 } }} transition={{ duration: 0.5 }} />
                  <motion.span className="absolute h-0.5 w-5 bg-current" variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }} transition={{ duration: 0.3 }} />
                  <motion.span className="absolute h-0.5 w-5 bg-current" variants={{ closed: { rotate: 0, y: 6 }, open: { rotate: -45, y: 0 } }} transition={{ duration: 0.3 }} />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-secondary md:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="h-16 flex justify-center items-center">
                <X className="text-primary text-3xl cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
              </div>

              <nav className="flex flex-1 flex-col items-center justify-center space-y-8 px-6">
                {navigationLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={link.href}
                      className="text-xl font-semibold text-primary hover:text-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="pb-12 flex justify-center">
                <MobileAuthSection />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;