import Heading from "../Products/Heading";
import Product from "../Products/Product";
import {
  bestSellerOne,
  bestSellerTwo,
  bestSellerThree,
  bestSellerFour,
} from "../../../assets/images/index";
import React, { useState, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import HomeProducts from "../Products/HomeProducts";

const BestSellers = () => {
  // const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  // const [fetchedProducts, setFetchedProducts] = useState([]);
  // const [filters, setFilters] = useState({
  //   category: null,
  //   color: null,
  //   priceOne: null,
  //   priceTwo: null,
  // });
  const [loading, setLoading] = useState(true);
  const fetchProducts = async () => {
    let response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/product/all`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: localStorage.getItem("token")
          ? JSON.stringify({ token: localStorage.getItem("token") })
          : JSON.stringify({}),
      }
    );
    let data = await response.json();
    if (response.status === 200) {
      setProducts(data);
      // setFetchedProducts(data);
    } else {
      if (
        data.error === "Token has expired" ||
        data.error === "Token is invalid"
      ) {
        toast.error(data.error, {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        localStorage.removeItem("token");
        // setTimeout(() => {
        //   navigate("/shop");
        // }, 3000);
      }
    }
  };

  const fetchData = useCallback(async () => {
    await fetchProducts();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, []);

  const [itemsPerPage, setItemsPerPage] = useState(12);
  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
  };

  return (
    <div className="w-full pb-20">
      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Heading heading="Products of your taste" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {Array.from(products.slice(0, 5)).map((product) => {
          return (
            <HomeProducts
              _id={product._id}
              img={product.url}
              productName={product.product_name}
              price={product.price}
              color={product.color}
              category={product.category}
              recommendation_score={product.recommendation_score}
              popularity_score={product.popularity_score}
              preference_score={product.preference_score}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BestSellers;
