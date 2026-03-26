import { FaFileAlt, FaUpload } from "react-icons/fa";
import { GrGallery } from "react-icons/gr";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";

export function BusinessAssets() {
  const assets = [
    { name: "Logo & Business Kit", icon: <MdOutlineAddPhotoAlternate /> },
    { name: "Business Guidelines", icon: <FaFileAlt /> },
    { name: "Product Photos", icon: <GrGallery /> },
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Business Assets
      </h3>

      <div className="space-y-3 mb-4">
        {assets.map((asset, index) => (
          <div key={index} className="flex items-center space-x-3 p-2">
            <span className="text-xl">{asset.icon}</span>
            <span className="text-slate-700">{asset.name}</span>
          </div>
        ))}
      </div>

      <button className="w-full bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-3">
        <FaUpload></FaUpload> Upload New Assets
      </button>
    </div>
  );
}
