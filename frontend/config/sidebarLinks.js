import { MdCampaign, MdOutlineDashboard, MdOutlineGroup } from "react-icons/md";
import { FiMessageSquare } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";

export const brandLinks = [
  {
    name: "My Dashboard",
    icon: <MdOutlineDashboard size={21} />,
    path: "/brand-dashboard",
  },
  {
    name: "Discover Influencers",
    icon: <MdOutlineGroup size={25} />,
    path: "/brand-dashboard/microinfluencerspage",
  },
  {
    name: "Campaigns",
    icon: <MdCampaign size={25} />,
    path: "/brand-dashboard/campaigns",
  },
  {
    name: "Messages",
    icon: <FiMessageSquare size={20} />,
    path: "/brand-dashboard/messages",
  },
  { name: "Subscription", icon: "💳", path: "/brand-dashboard/subscription" },
  {
    name: "Settings",
    icon: <IoSettingsOutline size={20} />,
    path: "/brand-dashboard/settings",
  },
];

export const influencerLinks = [
  {
    name: "My Dashboard",
    icon: <MdOutlineDashboard size={21} />,
    path: "/influencer-dashboard",
  },
  {
    name: "Discover Brands",
    icon: <MdOutlineGroup size={25} />,
    path: "/influencer-dashboard/brand",
  },
  {
    name: "Campaigns",
    icon: <MdCampaign size={25} />,
    path: "/influencer-dashboard/campaigns",
  },

  {
    name: "Messages",
    icon: <FiMessageSquare size={20} />,
    path: "/influencer-dashboard/messages",
    showUnread: true,
  },
  {
    name: "Subscription",
    icon: "💳",
    path: "/influencer-dashboard/subscription",
  },
  {
    name: "Settings",
    icon: <IoSettingsOutline size={20} />,
    path: "/influencer-dashboard/settings",
  },
];
