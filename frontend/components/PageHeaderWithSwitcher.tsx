import Link from "next/link";

interface PageHeaderWithSwitcherProps {
  role: "brand" | "influencers";
}

export default function PageHeaderWithSwitcher({
  role,
}: PageHeaderWithSwitcherProps) {
  const isBrand = role === "brand";

  return (
    <div className="text-center space-y-2 mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-primary">
        Hi, {isBrand ? "Brand" : "Influencer"} 👋
      </h1>
      {/* <p className="text-sm text-muted-foreground">
        {isBrand ? (
          <>
            Not a brand?{" "}
            <Link
              href="/influencer-onboarding"
              className="font-medium underline hover:text-primary"
            >
              Influencers click here
            </Link>
          </>
        ) : (
          <>
            Not a Influencer?{" "}
            <Link
              href="/brand-onboarding"
              className="font-medium underline hover:text-primary"
            >
              Brands click here
            </Link>
          </>
        )}
      </p> */}
    </div>
  );
}
