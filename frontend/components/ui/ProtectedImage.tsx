import React from "react";
import { Lock } from "lucide-react";
import Image from "next/image";

interface ProtectedImageProps {
  src: string;
  alt: string;
  isLocked?: boolean; // Controls the blur effect
  className?: string;
}

export const ProtectedImage = ({ src, alt, isLocked = true, className = "" }: ProtectedImageProps) => {
  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-all duration-500 ${
          isLocked ? "blur-[6px] scale-110 opacity-70" : "blur-0 scale-100 opacity-100"
        }`}
      />
      
      {/* The Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-10">
          <div className="bg-white/90 p-2 rounded-full shadow-sm backdrop-blur-md border border-white/50">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
};