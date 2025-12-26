import React, { useState, useCallback, useEffect } from "react";
// import { FaPlus } from "react-icons/fa";
import { ImPlus } from "react-icons/im";
import NavTitle from "./NavTitle";
import shuffle from "shuffle-array";
import { motion } from "framer-motion";

const Category = ({ filters, setFilters, fetchedProducts, setProducts }) => {
  const [categories, setCategories] = useState([]);

  const changeProducts = (my_category) => {
    let newfilter = { ...filters, category: my_category };
    setFilters({ ...filters, category: my_category });
    setProducts(
      fetchedProducts.filter(function (product) {
        if (newfilter.color && product.color !== newfilter.color) return false;
        if (newfilter.category && product.category !== my_category)
          return false;
        if (newfilter.priceOne && product.price <= newfilter.priceOne)
          return false;
        if (newfilter.priceTwo && product.price >= newfilter.priceTwo)
          return false;
        return true;
      })
    );
  };

  const fetchCategories = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/categorySuggestion`
    );
    const data = await response.json();
    setCategories(data.categories);
  };

  const fetchData = useCallback(async () => {
    await fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const [showCategories, setShowCategories] = useState(true);
  shuffle(categories);
  const items = categories.slice(0, 5);

  return (
    <div>
      <div
        onClick={() => setShowCategories(!showCategories)}
        className="cursor-pointer"
      >
        <NavTitle title="Shop by Category" icons={true} />
      </div>
      {showCategories && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {items.map((itemName, i) => (
              <li
                key={i}
                className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center justify-between cursor-pointer hover:text-primeColor hover:border-gray-400 duration-300"
                onClick={() => {
                  changeProducts(itemName);
                }}
              >
                {itemName}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Category;
