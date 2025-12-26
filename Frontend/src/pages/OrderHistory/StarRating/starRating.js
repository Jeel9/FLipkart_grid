import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { Container, Radio, Rating } from "./RatingStyles";
import { ToastContainer, toast } from "react-toastify";

const Rate = ({product,userId}) => {
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(0);

  const applyRating = async (givenRating) => {
    if(!loading){
      setLoading(true);
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/rate/${product._id.$oid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: localStorage.getItem("token"),
            rating: givenRating,
          }),
        }
        );
        let data = await response.json();
        
        if (response.status !== 200) {
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
        } else {
          toast.success(data.message, {
            position: "top-left",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          window.location.reload();
          // navigate('/orderhistory');
          setLoading(false);
        }
      };
    }

  return (
    <Container>
      {product.ratings && product.ratings[userId] !== undefined ? (
        <>
          {[...Array(product.ratings[userId])].map((_, index) => (
            <label key={index}>
              <Rating>
                <FaStar
                  color="#000"
                  size={30}
                />
              </Rating>
            </label>
          ))}
          {[...Array(5 - product.ratings[userId])].map((_, index) => (
            <label key={index}>
              <Rating>
                <FaStar
                  color="rgb(192,192,192)"
                  size={30}
                />
              </Rating>
            </label>
          ))}
        </>
      ) : (
        [...Array(5)].map((_, index) => {
          const givenRating = index + 1;
          return (
            <label key={index}>
              <Radio
                type="radio"
                value={givenRating}
                onClick={() => {
                  if(!loading){
                    setRate(givenRating);
                    applyRating(givenRating);
                  }
                }}
              />
              <Rating>
                <FaStar
                  color={
                    givenRating <= rate ? "#000" : "rgb(192,192,192)"
                  }
                  size={30}
                />
              </Rating>
            </label>
          );
        })
      )}
    </Container>
  );
};

export default Rate;
