import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const ProductInfo = ({ productInfo }) => {
  const [loading, setLoading] = useState(true);
  const fetchProduct = async () => {
    let response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/product/${productInfo._id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: localStorage.getItem("token")
          ? JSON.stringify({ token: localStorage.getItem("token") })
          : JSON.stringify({}),
      }
    );
    let data = await response.json();
    if (response.status !== 200) {
      if (
        data.error === "Token has expired" ||
        data.error === "Token is invalid"
      ) {
        localStorage.removeItem("token");
      }
    }
  };

  const fetchData = useCallback(async () => {
    await fetchProduct();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, []);

  const dispatch = useDispatch();
  return (
    <>
      {loading ? (
        <></>
      ) : (
        <div className="flex flex-col gap-5">
          <h2 className="text-4xl font-semibold">{productInfo.productName}</h2>
          <p className="text-xl font-semibold">Rs. {productInfo.price}</p>
          <p className="font-medium text-lg">
            <div>
              <span className="font-normal">Color:</span> {productInfo.color}
            </div>
            <div>
              <span className="font-normal">Category:</span>{" "}
              {productInfo.category}
            </div>
          </p>
          <button
            onClick={() =>
              dispatch(
                addToCart({
                  _id: productInfo._id.$oid,
                  name: productInfo.productName,
                  quantity: 1,
                  image: productInfo.img,
                  price: productInfo.price,
                  color: productInfo.color,
                  category: productInfo.category,
                })
              )
            }
            className="w-full py-4 bg-primeColor hover:bg-black duration-300 text-white text-lg font-titleFont"
          >
            Add to Cart
          </button>
        </div>
      )}
    </>
  );
};

export default ProductInfo;
