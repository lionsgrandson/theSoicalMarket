"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { motion } from 'framer-motion';

export default function Footer() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathName = usePathname();
  const router = useRouter();
  const [token,setToken]=useState<string | null>(null);
  //console.log(pathName);
  const handleSignupRoute = () => {
    setShowAuthModal(true);
  };

  useEffect(()=>{
    setToken(localStorage.getItem("access_token"));
  },[]);

  return (
    <footer className="">
      {/* CTA Section */}
      {!token && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
              Ready to grow smarter?
            </h2>

            <motion.button
            onClick={handleSignupRoute}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 20px rgba(0, 31, 63, 0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            className="inline-block bg-secondary hover:bg-[var(--secondaryhover)] 
            text-primary font-semibold px-10 py-4 rounded-lg 
            transition-all duration-200 shadow-md cursor-pointer"
          >
            Sign Up Free Today 🚀
          </motion.button>

            <p className="text-sm text-gray-600 italic mt-4">
              Free for the first 100 users
            </p>
            <p className="text-sm text-gray-600  mt-4">
              Just follow us on instagram <Link className=" cursor-pointer" target="_blank" href={"https://www.instagram.com/thesocialmarketofficial"}>@thesocialmarketofficial</Link> and DM us for the code
            </p>
          </div>
        )}

      {/* Auth Required Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join The Social Market</DialogTitle>
            <DialogDescription>
              Choose your role to continue. You can always switch later if
              needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                router.push("/auth/signup?role=influencer&returnTo=/influencer-onboarding");
                
              }}
            >
              Sign up as Influencer
            </Button>
            <Button
              onClick={() => {
                router.push("/auth/signup?role=brand&returnTo=/brand-onboarding");
                
              }}
            >
              Sign up as Brand
            </Button>
            <Button
              onClick={() => {
                router.push("/auth/signup?role=both&returnTo=/brand-onboarding");
               
              }}
            >
              Sign up as Both
            </Button>
          </div>

          <div className="flex justify-center pt-4 text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-primary hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Links */}
      <div className=" py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span className="text-gray-400 hidden sm:inline">|</span>

            <Link
              href="/brands"
              className="hover:text-gray-900 transition-colors"
            >
               Brands
            </Link>
            <span className="text-gray-400 hidden sm:inline">|</span>

            <Link
              href="/microinfluencers"
              className="hover:text-gray-900 transition-colors"
            >
               Influencers
            </Link>
            <span className="text-gray-400 hidden sm:inline">|</span>

            <Link
              href="/about"
              className="hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            {/* <span className="text-gray-400 hidden sm:inline">|</span> */}

            {/* <Link
              href="/help"
              className="hover:text-gray-900 transition-colors"
            >
              Help
            </Link> */}
            {/* <span className="text-gray-400 hidden sm:inline">|</span> */}

            {/* <Link
              href="/privacy"
              className="hover:text-gray-900 transition-colors"
            >
              Terms
            </Link> */}
            <span className="text-gray-400 hidden sm:inline">|</span>

            <Link
              href="/privacy"
              className="hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
