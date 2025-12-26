import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { emptyCart } from "../../assets/images/index";
import OrderedItemCard from "./OrderedItemCard";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const OrderHistory = () => {
  const products = useSelector((state) => state.orebiReducer.products);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const fetchOrders = async () => {
    let response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/order/all`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: localStorage.getItem("token") }),
      }
    );
    let data = await response.json();
    if (response.status === 200) {
      setOrders(data);
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
          navigate("/signin");
        }, 3000);
      }
    }
  };

  const fetchData = useCallback(async () => {
    await fetchOrders();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (localStorage.getItem("token") === null) {
      toast.error("Please signin or signup to view order history", {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setLoading(false);
      setHasSignedIn(false);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      fetchData();
      setLoading(false);
      setHasSignedIn(true);
    }
  }, []);

  return (
    <>
      {loading ? (
        <></>
      ) : hasSignedIn ? (
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
          <Breadcrumbs title="Order History" />
          {orders.length > 0 ? (
            Array.from(orders).map((order) => (
              <div className="my-5 bg-slate-200 p-3 rounded-lg">
                <div className="font-semibold text-xl my-2">
                  Order Total: {order.totalSum}
                </div>
                <div className="font-semibold text-xl my-2">
                  Product Sum Total: {order.productSum}
                </div>
                <div className="font-semibold text-xl mb-5 mt-2">
                  Shipping Charges: {order.shippingSum}
                </div>
                {order["products"].length > 0 ? (
                  <div className="pb-20">
                    <div className="w-full h-20 bg-[#F5F7F7] text-primeColor hidden lgl:grid grid-cols-6 place-content-center px-6 text-lg font-titleFont font-semibold">
                      <h2 className="col-span-2">Product</h2>
                      <h2>Price</h2>
                      <h2>Quantity</h2>
                      <h2>Sub Total</h2>
                      <h2>Rate</h2>
                    </div>
                    <div className="mt-5">
                      {order["products"].map((item, i) => (
                        <div key={item._id.$oid}>
                          <OrderedItemCard
                            userId={order["userId"]}
                            item={item}
                            quantity={order["quantity"][i]}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ))
          ) : (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col mdl:flex-row justify-center items-center gap-4 pb-20"
            >
              <div>
                <img
                  className="w-80 rounded-lg p-4 mx-auto"
                  src={emptyCart}
                  alt="emptyCart"
                />
              </div>
              <div className="max-w-[500px] p-4 py-8 bg-white flex gap-4 flex-col items-center rounded-md shadow-lg">
                <h1 className="font-titleFont text-xl font-bold uppercase">
                  You have not ordered yet.
                </h1>
                <p className="text-sm text-center px-10 -mt-2">
                  Check out our products and fill it with books, electronics,
                  videos, etc.
                </p>
                <Link to="/shop">
                  <button className="bg-primeColor rounded-md cursor-pointer hover:bg-black active:bg-gray-900 px-8 py-2 font-titleFont font-semibold text-lg text-gray-200 hover:text-white duration-300">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}
    </>
  );
};

export default OrderHistory;
