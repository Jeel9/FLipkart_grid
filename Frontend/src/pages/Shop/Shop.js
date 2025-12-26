import React, { useState, useCallback, useEffect } from "react";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Pagination from "../../components/pageProps/shopPage/Pagination";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: null,
    color: null,
    priceOne: null,
    priceTwo: null,
  });
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
      setFetchedProducts(data);
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
        setTimeout(() => {
          navigate("/shop");
        }, 3000);
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
    <>
      {loading ? (
        <></>
      ) : (
        <div className="max-w-container mx-auto px-4">
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
          <Breadcrumbs title="Products" />
          <div className="w-full h-full flex pb-20 gap-10">
            <div className="w-[20%] lgl:w-[25%] hidden mdl:inline-flex h-full">
              {/* {console.log(products)} */}
              <ShopSideNav
                filters={filters}
                setFilters={setFilters}
                fetchedProducts={fetchedProducts}
                setProducts={setProducts}
              />
            </div>
            <div className="w-full mdl:w-[80%] lgl:w-[75%] h-full flex flex-col gap-10">
              <ProductBanner itemsPerPageFromBanner={itemsPerPageFromBanner} />
              <Pagination itemsPerPage={itemsPerPage} items={products} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shop;
