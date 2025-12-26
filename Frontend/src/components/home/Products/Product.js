import React from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { GiReturnArrow } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import Image from "../../designLayouts/Image";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const Product = (props) => {
  const dispatch = useDispatch();
  const _id = props._id;

  const rootId = _id;

  const navigate = useNavigate();
  const productItem = props;

  const handleProductDetails = () => {
    navigate(`/product/${rootId}`, {
      state: {
        item: productItem,
      },
    });
  };

  return (
    <div className="w-full relative group">
      <div
        onClick={handleProductDetails}
        className="max-w-80 max-h-80 relative overflow-y-hidden "
      >
        <div>
          <Image className="w-full h-full" imgSrc={props.img} />
        </div>
      </div>
      <div className="max-w-80 py-6 flex flex-col gap-1 border-[1px] border-t-0 px-4">
        <div className="flex items-center justify-between font-titleFont">
          <h2 className="text-lg text-primeColor font-bold">
            {props.productName}
          </h2>
          <p className="text-[#767676] text-[20px]">₹{props.price}</p>
        </div>
        <div className="flex items-center justify-between font-titleFont">
          <div className="flex flex-col">
            <p className="text-[#767676] text-[14px] my-1">{props.color}</p>
            <p className="text-[#767676] text-[14px]">{props.category}</p>
          </div>
          <button
            onClick={() =>
              dispatch(
                addToCart({
                  _id: rootId,
                  name: props.productName,
                  quantity: 1,
                  image: props.img,
                  price: props.price,
                  color: props.color,
                  category: props.category,
                })
              )
            }
            className="w-32 h-12 flex items-center justify-center gap-2 bg-primeColor text-sm font-normal text-white hover:bg-black duration-300"
          >
            <span>
              <FaShoppingCart />
            </span>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
