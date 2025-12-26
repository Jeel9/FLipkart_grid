import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";
import shuffle from "shuffle-array";

const Color = ({ filters, setFilters, fetchedProducts, setProducts }) => {
  const [colors, setColors] = useState([]);

  const changeProducts = (my_color) => {
    let newfilter = { ...filters, color: my_color };
    setFilters({ ...filters, color: my_color });
    setProducts(
      fetchedProducts.filter(function (product) {
        if (newfilter.color && product.color !== my_color) return false;
        if (newfilter.category && product.category !== newfilter.category)
          return false;
        if (newfilter.priceOne && product.price <= newfilter.priceOne)
          return false;
        if (newfilter.priceTwo && product.price >= newfilter.priceTwo)
          return false;
        return true;
      })
    );
  };

  const fetchColors = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/colorSuggestion`
    );
    const data = await response.json();
    let color_names = data["colors"],
      colors_hex = data["color_hex"];
    let formatted_colors = Array.from(color_names).map((color_name, i) => ({
      _id: i,
      title: color_name,
      base: colors_hex[i],
    }));
    setColors(formatted_colors);
  };

  const fetchData = useCallback(async () => {
    await fetchColors();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const [showColors, setShowColors] = useState(true);
  shuffle(colors);
  let items = colors.slice(0, 5);

  return (
    <div>
      <div
        onClick={() => setShowColors(!showColors)}
        className="cursor-pointer"
      >
        <NavTitle title="Shop by Color" icons={true} />
      </div>
      {showColors && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {items.map((item) => (
              <li
                key={item._id}
                className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 hover:text-primeColor hover:border-gray-400 duration-300 cursor-pointer"
                onClick={() => {
                  changeProducts(item.title);
                }}
              >
                <span
                  style={{ background: item.base }}
                  className={`w-3 h-3 bg-gray-500 rounded-full`}
                ></span>
                {item.title}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Color;
