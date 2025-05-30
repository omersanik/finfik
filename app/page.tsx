import MainCardComponent from "@/components/MainCardComponent";
import SectionCardComponent from "@/components/SectionCardComponent";
import finance1 from "@/thumbnails/finance1.webp";
import stockthumbanil from "@/thumbnails/understanding-stocks.png";

const page = () => {
  return (
    <main>
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>
      <MainCardComponent
        title="Understanding Stocks"
        thumbnail={stockthumbanil}
        description="Learn the basics of how stocks work, what drives their prices, and why they matter in building wealth."
      />
      <p className="text-3xl font-bold pt-6">Your Courses</p>
      <div className="flex items-center justify-center max-sm:flex-col px-12">
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance1}
        />

        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance1}
        />

        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance1}
        />
      </div>
    </main>
  );
};

export default page;
