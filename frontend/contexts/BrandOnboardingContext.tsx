import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { uploadToCloudinary, FileUploadResponse } from "@/lib/fileUpload";
interface BrandOnboardingData {
  // From BusinessInfoStep
  businessName: string;
  designation:string;
  mission:string;
  website: string;
  timeZone: string;
  bio: string;
  businessTypes: string[];
  logoFile?: File | null;
  logoUrl?: string;
  // From ProfileSetupStep
  targetAudience: string[];
  keywords: string;
  demographics: string[];
  values: string[];

  // From PaymentStep
  selectedPlan: string;
  billingCycle: "monthly" | "yearly";

  // From CampaignStep
  campaignName: string;
  posterPreview?:string;
  objective: string;
  budget: number[];
  budgetType: string;
  paymentPreferences: string[];
  description: string;
  deliverables: string[];
  timeline: string;
  approvalRequired: boolean;
  autoMatch: boolean;
  targetAudienceCampaign: string;
  campaign_poster?:string;
}

interface BrandOnboardingContextType {
  onboardingData: BrandOnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<BrandOnboardingData>>;
  uploadLogo: (file: File) => Promise<FileUploadResponse>;
}
const BrandOnboardingContext = createContext<
  BrandOnboardingContextType | undefined
>(undefined);
const initialState: BrandOnboardingData = {
  businessName: "",
  designation:"",
  mission:"",
  website: "",
  bio: "",
  businessTypes: [],
  logoFile: null,
  logoUrl: "",
  targetAudience: [],
  keywords: "",
  demographics: [],
  values: [],
  selectedPlan: "",
  billingCycle: "monthly",
  campaignName: "",
  posterPreview:"",
  objective: "",
  budget: [1000],
  budgetType: "total",
  paymentPreferences: [],
  description: "",
  deliverables: [],
  timeline: "",
  approvalRequired: true,
  autoMatch: false,
  timeZone: "",
  targetAudienceCampaign: "",
  campaign_poster: "",
};
const BrandOnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<BrandOnboardingData>(
    () => {
      try {
        const storedData = localStorage.getItem("brandOnBoardingData");
        return storedData ? JSON.parse(storedData) : initialState;
      } catch (error) {
        console.error(
          "Failed to parse brand onboarding data from localStorage",
          error
        );
        return initialState;
      }
    }
  );

  useEffect(() => {
    // Only save non-file data to localStorage
    const { logoFile, ...dataToStore } = onboardingData;
    localStorage.setItem("brandOnBoardingData", JSON.stringify(dataToStore));
  }, [onboardingData]);

  const uploadLogo = async (file: File): Promise<FileUploadResponse> => {
    try {
      const result = await uploadToCloudinary(file);
      if (result.success && result.url) {
        setOnboardingData((prev) => ({
          ...prev,
          logoFile: file,
          logoUrl: result.url!,
        }));
      }
      return result;
    } catch (error) {
      console.error("Logo upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  return (
    <BrandOnboardingContext.Provider
      value={{ onboardingData, setOnboardingData, uploadLogo }}
    >
      {children}
    </BrandOnboardingContext.Provider>
  );
};
export default BrandOnboardingProvider;

export const useBrandOnBoarding = () => {
  const context = useContext(BrandOnboardingContext);
  if (!context) {
    throw new Error(
      "useBrandOnboarding must be used within a BrandOnboardingProvider"
    );
  }
  return context;
};
