import MainCardComponent from "@/components/MainCardComponent";

import stockthumbanil from "@/thumbnails/understanding-stocks.png";

const page = () => {
  return (
    <main>
      <MainCardComponent
        title="Understanding Stocks"
        thumbnail={stockthumbanil}
        description="Learn the basics of how stocks work, what drives their prices, and why they matter in building wealth."
      />
    </main>
  );
};

export default page;
