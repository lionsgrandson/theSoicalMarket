export interface Brand {
  id?: string | number;
  userId?: string;
  name: string;
  designation:string;
  description?: string;
  logo?: string;
  verified?: boolean;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  timeZone?:string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  mission?: string;
  businessType?: string;
  contactPerson?: {
    name?: string;
    title?: string;
  };
  campaigns?: {
    total?: number;
    creators?: number;
    avgRating?: number;
    totalInvested?: number;
  };
  activeCampaigns?: any[];
  reviews?: any[];
  resources?: any[];
}
