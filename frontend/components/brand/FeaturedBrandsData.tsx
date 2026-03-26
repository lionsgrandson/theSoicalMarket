// import { Brand } from "@/lib/types";
// import { apiClient } from "@/lib/apiClient";
// import BrandPage from "@/app/(dashboard)/influencer-dashboard/brand/page";
// const getCleanCategory = (rawString?: string) => {
//     if (!rawString) return "Others";
//     return rawString.split(/[–-]/)[0].split(",")[0].trim();
//   };
// async function getBrands() {
//   const res = await apiClient("user_service/get_all_brands/", {
//     method: "GET",
//   });

//   const data: BrandApiResponse[] = Array.isArray(res?.data)
//     ? res.data
//     : [];

//   const normalised: Brand[] = data.map((raw) => {
//     const bp = raw.brand_profile ?? {};
//     const platforms: string[] = Array.isArray(bp.platforms)
//       ? bp.platforms
//       : [];

//     return {
//       id: String(raw.id ?? ""),
//       userId: raw.user?.id ? String(raw.user.id) : undefined,
//       name: bp.business_name || raw?.user?.first_name || "Unnamed Brand",
//       description: bp.short_bio ?? "",
//       timeZone: bp.timezone ?? "Others",
//       logo: bp.logo ?? undefined,
//       businessType: getCleanCategory(bp.business_type) ?? undefined,
//       website: bp.website ?? undefined,
//       socialLinks: {
//         instagram: platforms.includes("instagram") ? "#" : undefined,
//         tiktok: platforms.includes("tiktok") ? "#" : undefined,
//         youtube: platforms.includes("youtube") ? "#" : undefined,
//       },
//     };
//   });

//   return normalised;
// }

// export default async function BrandsPage() {
//   const brands = await getBrands();

//   return <BrandPage brands={brands} />;
// }
