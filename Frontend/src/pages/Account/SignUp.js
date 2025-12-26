import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const SignUp = () => {
  const navigate = useNavigate();

  // ============= Initial State Start here =============
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("");
  const [favoriteColor, setFavoriteColor] = useState("");
  const [favoriteColorList, setFavoriteColorList] = useState([]);
  const [colorSuggestions, setColorSuggestions] = useState([]);
  // const [colorHexSuggestions, setColorHexSuggestions] = useState([]);
  const [favoriteCategory, setFavoriteCategory] = useState("");
  const [favoriteCategoryList, setFavoriteCategoryList] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [checked, setChecked] = useState(false);

  // ============= API's ===================
  const fetchColorSuggestions = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/colorSuggestion`
    );
    const data = await response.json();
    setColorSuggestions(
      Array.from(data.colors).map((color, index) => ({
        color: color,
        color_hex: data.color_hex[index],
      }))
    );
    // setColorHexSuggestions(data.color_hex);
  };

  const fetchCategorySuggestions = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/categorySuggestion`
    );
    const data = await response.json();
    setCategorySuggestions(data.categories);
  };

  const fetchData = useCallback(async () => {
    await fetchColorSuggestions();
    await fetchCategorySuggestions();
    // setState(data)
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleAge = (e) => {
    setAge(e.target.value);
  };

  const handleGender = (e) => {
    setGender(e.target.value);
  };

  const handleFavoriteColor = (event) => {
    setFavoriteColor(event.target.value);
  };

  const handleAddFavoriteColor = () => {
    if (favoriteColor.trim() !== "") {
      setFavoriteColorList(
        Array.from(new Set([...favoriteColorList, favoriteColor]))
      );
      setFavoriteColor("");
    }
  };
  const handleFavoriteCategory = (event) => {
    setFavoriteCategory(event.target.value);
  };

  const handleAddFavoriteCategory = () => {
    if (favoriteCategory.trim() !== "") {
      setFavoriteCategoryList(
        Array.from(new Set([...favoriteCategoryList, favoriteCategory]))
      );
      setFavoriteCategory("");
    }
  };

  // ============= Event Handler End here ===============

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (checked) {
      // ============== Getting the value ==============
      if (
        username &&
        password &&
        password.length >= 1 &&
        age &&
        gender &&
        Array.isArray(favoriteColorList) &&
        favoriteColorList.length > 0 &&
        Array.isArray(favoriteCategoryList) &&
        favoriteCategoryList.length > 0
      ) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/users/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: username,
              password: password,
              age: age,
              gender: gender,
              favorite_colors: favoriteColorList,
              favorite_categories: favoriteCategoryList,
            }),
          }
        );

        const data = await response.json();
        if (response.status === 200) {
          toast.success("Signup Successful", {
            position: "top-left",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setTimeout(() => {
            navigate("/signin", {});
          }, 3000);
          setUsername("");
          setPassword("");
          setAge("");
          setGender("");
          setFavoriteCategory("");
          setFavoriteCategoryList([]);
          setFavoriteColor("");
          setFavoriteColorList([]);
        } else {
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
        }
      } else {
        toast.error("Enter all details", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-start">
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
      <div className="w-1/2 hidden lgl:inline-flex h-full text-white">
        <div className="w-[450px] h-full bg-primeColor px-10 flex flex-col gap-6 justify-center">
          <div className="flex flex-col gap-1 -mt-1">
            <h1 className="font-titleFont text-2xl font-medium mb-3">
              Create a free account
            </h1>
            <p className="text-base">
              Please enter details in all the fields to create a new account
            </p>
          </div>
        </div>
      </div>
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
      <div className="w-full lgl:w-[500px] h-full flex flex-col justify-center">
        <form className="w-full lgl:w-[500px] h-screen flex items-center justify-center">
          <div className="px-6 py-4 w-full h-[96%] flex flex-col justify-start overflow-y-scroll scrollbar-thin scrollbar-thumb-primeColor">
            <h1 className="font-titleFont underline underline-offset-4 decoration-[1px] font-semibold text-2xl mdl:text-3xl mb-4">
              Create your account
            </h1>
            {/* Username */}
            <div className="flex flex-col gap-.5">
              <p className="font-titleFont text-base font-semibold text-gray-600">
                Username
              </p>
              <input
                onChange={handleUsername}
                value={username}
                className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                placeholder="Enter your username"
              />
            </div>
            {/* Password */}
            <div className="flex flex-col gap-.5">
              <p className="font-titleFont text-base font-semibold text-gray-600">
                Password
              </p>
              <input
                onChange={handlePassword}
                value={password}
                className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                type="password"
                placeholder="Create password"
              />
            </div>
            {/* Age */}
            <div className="flex flex-col gap-.5">
              <p className="font-titleFont text-base font-semibold text-gray-600">
                Age
              </p>
              <input
                onChange={handleAge}
                value={age}
                className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                type="text"
                placeholder="Enter your age"
              />
            </div>
            {/* Gender */}
            <div className="flex flex-col gap-.5">
              <p className="font-titleFont text-base font-semibold text-gray-600">
                Gender
              </p>
              <input
                onChange={handleGender}
                value={gender}
                className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                type="text"
                placeholder="Your gender"
              />
            </div>
            <div className="flex flex-col gap-.5">
              <p className="font-titleFont text-base font-semibold text-gray-600">
                Favorite Color
              </p>
              <input
                type="text"
                value={favoriteColor}
                onChange={handleFavoriteColor}
                placeholder="Enter your favorite color"
                className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                list="colorList"
              />
              <datalist id="colorList">
                {colorSuggestions.map((color) => (
                  <option key={color.color} value={color.color}>
                    {color.color}
                  </option>
                ))}
              </datalist>
              <div
                onClick={handleAddFavoriteColor}
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                Add
              </div>
              <div className="">
                {favoriteColorList.map((colorInList) => {
                  const selectedColor = colorSuggestions.find(
                    (color) => color.color === colorInList
                  );
                  if (selectedColor) {
                    const colorStyle = {
                      backgroundColor: selectedColor.color_hex,
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      margin: "2px",
                    };

                    return (
                      <span
                        key={colorInList}
                        className="font-semibold cursor-pointer w-fit rounded-md my-2 mr-3"
                        style={colorStyle}
                      >
                        {colorInList}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <div className="flex flex-col gap-.5">
              <p className="font-titleFont text-base font-semibold text-gray-600">
                Favorite Category
              </p>
              <input
                type="text"
                value={favoriteCategory}
                onChange={handleFavoriteCategory}
                placeholder="Enter your favorite category"
                className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                list="categoryList"
              />
              <datalist id="categoryList">
                {Array.from(categorySuggestions).map((category) => {
                  return <option value={category}></option>;
                })}
              </datalist>
              <span
                onClick={handleAddFavoriteCategory}
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                Add
              </span>
              <div className="mb-4">
                {favoriteCategoryList.map((categoryInList) => {
                  return (
                    <span
                      key={categoryInList}
                      className="bg-cyan-300 font-semibold cursor-pointer w-fit p-1 rounded-md my-2 mr-3"
                    >
                      {categoryInList}
                    </span>
                  );
                })}
              </div>
            </div>
            {/* Checkbox */}
            <div className="flex items-start mdl:items-center gap-2">
              <input
                onChange={() => setChecked(!checked)}
                className="w-4 h-4 mt-1 mdl:mt-0 cursor-pointer"
                type="checkbox"
              />
              <p className="text-sm text-primeColor">
                I agree to the
                <span className="text-blue-500">Terms of Service </span>and{" "}
                <span className="text-blue-500">Privacy Policy</span>.
              </p>
            </div>
            <button
              onClick={handleSignUp}
              className={`${
                checked
                  ? "bg-primeColor hover:bg-black hover:text-white cursor-pointer"
                  : "bg-gray-500 hover:bg-gray-500 hover:text-gray-200 cursor-none"
              } w-full text-gray-200 text-base font-medium h-10 rounded-md hover:text-white duration-300`}
            >
              Create Account
            </button>
            <p className="text-sm text-center font-titleFont font-medium">
              Don't have an Account?{" "}
              <Link to="/signin">
                <span className="hover:text-blue-600 duration-300">
                  Sign in
                </span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
