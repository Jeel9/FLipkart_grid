import React, { useState, useCallback, useEffect } from "react";
// import { SplOfferData } from "../../../constants";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProductsOnSale = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState(true);
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
      setProducts(data.slice(0, 5));
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

  return (
    <div>
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
      {loading ? (
        <></>
      ) : (
        <div>
          <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
            Recommendations
          </h3>
          <div className="flex flex-col gap-2">
            {Array.from(products).map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 border-b-[1px] border-b-gray-300 py-2"
              >
                <div>
                  <img className="w-24" src={item.url} alt={item.url} />
                </div>
                <div className="flex flex-col gap-2 font-titleFont">
                  <p className="text-base font-medium">{item.product_name}</p>
                  <p className="text-sm font-semibold">Rs. {item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsOnSale;
