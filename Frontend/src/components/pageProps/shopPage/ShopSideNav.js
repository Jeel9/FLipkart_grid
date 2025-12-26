import React from "react";
import Category from "./shopBy/Category";
import Color from "./shopBy/Color";
import Price from "./shopBy/Price";

const ShopSideNav = ({ filters, setFilters, fetchedProducts, setProducts }) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <button
        className="self-baseline bg-slate-300 p-3 rounded-2xl font-bold"
        onClick={() => {
          let newfilter = {
            category: null,
            color: null,
            priceOne: null,
            priceTwo: null,
          };
          setFilters(newfilter);
          setProducts(
            fetchedProducts.filter(function (_) {
              return true;
            })
          );
        }}
      >
        Clear filters
      </button>
      <Category
        filters={filters}
        setFilters={setFilters}
        fetchedProducts={fetchedProducts}
        setProducts={setProducts}
      />
      <Color
        filters={filters}
        setFilters={setFilters}
        fetchedProducts={fetchedProducts}
        setProducts={setProducts}
      />
      <Price
        filters={filters}
        setFilters={setFilters}
        fetchedProducts={fetchedProducts}
        setProducts={setProducts}
      />
    </div>
  );
};

export default ShopSideNav;
