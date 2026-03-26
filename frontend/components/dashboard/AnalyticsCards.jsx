import Link from "next/link";

export function AnalyticsCards({ allCampaigns,previousHirings,uniqueInfluencer}) {
  
  const numOfInfluencers=uniqueInfluencer.length;
  const totalInvested=previousHirings.reduce((acc,hiring)=>acc+hiring.budget,0);
  const analyticsData = [
    { value: allCampaigns.length, label: "Total Campaigns", color: "#BC8D03" , hlink:"/brand-dashboard/campaigns" },
    { value: numOfInfluencers, label: "Micro-influencers", color: "#BC8D03" },
    { 
  value: `$${Number(totalInvested).toLocaleString()}`, 
  label: "Total Invested", 
  color: "#BC8D03" 
},
  ];


  return (
    <div>
      <h3 className="text-2xl font-semibold text-slate-800 mb-4">Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {analyticsData.map((item, index) => {
    const Card = (
      <div className="bg-slate-200/50 rounded-lg p-6 text-center">
        <div className="text-3xl text-secondary font-bold mb-2">
          {item.value}
        </div>
        <div className="text-slate-600 text-sm font-medium">
          {item.label}
        </div>
      </div>
    );

    return item.hlink ? (
      <Link
        key={index}
        href={item.hlink}
        className="block hover:scale-[1.02] transition-transform cursor-pointer"
      >
        {Card}
      </Link>
    ) : (
      <div key={index}>{Card}</div>
    );
  })}
</div>

    </div>
  );
}
