import MainCardComponent from "@/components/MainCardComponent";
import SectionCardComponent from "@/components/SectionCardComponent";
import finance1 from "@/thumbnails/finance1.webp";
import finance2 from "@/thumbnails/finance2.webp";
import finance3 from "@/thumbnails/finance3.webp";
import stockthumbanil from "@/thumbnails/understanding-stocks.png";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId } = await auth(); // await and destructure

  if (!userId) {
    return <h1 className="text-3xl m-10">Landing Page</h1>;
  }

  return (
    <main>
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>
      <MainCardComponent
        title="Understanding Stocks"
        thumbnail={stockthumbanil}
        description="Learn the basics of how stocks work, what drives their prices, and why they matter in building wealth."
        slug="understanding-stocks"
      />
      <p className="text-3xl font-bold pt-6 my-6 mx-10">Your Courses</p>
      <div className="flex items-center justify-center max-sm:flex-col px-12 mb-6">
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance1}
        />
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance2}
        />
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance3}
        />
      </div>
    </main>
  );
};

export default Page;
