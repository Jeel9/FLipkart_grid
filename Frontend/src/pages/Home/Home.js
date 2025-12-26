import React from "react";
import BestSellers from "../../components/home/BestSellers/BestSellers";
import Sale from "../../components/home/Sale/Sale";


const Home = () => {
  return (
    <div className="w-full mx-auto">
      {/* <Banner /> */}
      {/* <BannerBottom /> */}
      <div className="max-w-container mx-auto px-4">
        <Sale />
        {/* <NewArrivals /> */}
        <BestSellers />
        {/* <YearProduct /> */}
        {/* <SpecialOffers /> */}
      </div>
    </div>
  );
};

export default Home;
