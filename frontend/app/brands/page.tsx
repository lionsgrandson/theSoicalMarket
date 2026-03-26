import { apiClient } from "@/lib/apiClient";
import BrandListWithSearch from "@/components/BrandListWithSearch";

export interface BrandProfile {
  id: number;
  business_name: string | null;
  display_name: string | null;
  business_type: string | null;
  logo: string | null;
  short_bio: string | null;
  keyword_hashtags: string | null;
  audience_demographic: string | null;
  brand_tone: string | null;
  choosen_plan: string | null;
  designation: string | null;
  instagram_handle: string | null;
  linkedin_profile: string | null;
  tiktok_handle: string | null;
  x_handle: string | null;
  whatsapp_business: string | null;
  website: string | null;
  timezone: string | null;
  targeted_audience: string | null;
  mission: string | null;
}
interface Brand {
  id: number;
}
interface BrandApiResponse {
  id: number;
  brand_profile: BrandProfile;
  brand: Brand;
  user?:{
    id:number,
    first_name:string;
  }
}

export default async function BrandsPage() {
  async function fetchBrands() {
    try {
      const res = await apiClient("user_service/get_featured_brands/", {
        method: "GET",
      });

      const items: BrandApiResponse[] = res ?? [];

      return items.map((brand: BrandApiResponse) => ({
        id: brand?.id,
        userId:brand?.user?.id?? 0,
        name:
          brand?.brand_profile?.display_name ||
          brand?.brand_profile?.business_name 
          || brand?.user?.first_name || "Unnamed",
        location: brand?.brand_profile?.timezone || "Location not specified",
        category: brand?.brand_profile?.business_type
          ? brand.brand_profile.business_type.split("–")[0].trim()
          : "General Brand",
        description: brand?.brand_profile?.short_bio || "",
        image: brand?.brand_profile?.logo || "/images/placeholder.jpg",
        logo: brand?.brand_profile?.logo || "/images/placeholder.jpg",
        service: "Brand Campaign",
        rating: 4.5,
        reviews: 0,
      }));
    } catch (error) {
      console.error("Failed to fetch brands", error);
      return [];
    }
  }


  // const fetchPlan=async()=>
  // {
  //   try {
  //     const res = await apiClient("subscription_service/get_user_subscription_information/", {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         },
  //       });
  //     return await res?.data?.plan_name;
  //   } catch (error) {
      
  //   }
  // }

  const brands = await fetchBrands();
  console.log(brands);
  // const planName=await fetchPlan();
  // console.log(planName);
  

  // We pass the data to the client component, which now handles the full layout
  return <BrandListWithSearch brands={brands} />;
}