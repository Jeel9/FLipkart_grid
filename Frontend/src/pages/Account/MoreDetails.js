import React, { useState } from "react";
import { Link } from "react-router-dom";


const colorOptions = [
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
];

const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothes', label: 'Clothes' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'home appliances', label: 'Home Appliances' },
];


const MoreDetails = () => {
    // ============= Initial State Start here =============
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [favoriteColor, setFavoriteColor] = useState([]);
    const [favoriteCategories, setFavoriteCategories] = useState([]);
    // ============= Initial State End here ===============

    // ============= Error Msg Start here =================
    const [errEmail, setErrEmail] = useState("");
    const [errPassword, setErrPassword] = useState("");
    // ============= Error Msg End here ===================
    const [successMsg, setSuccessMsg] = useState("");

    // ============= Event Handler Start here =============
    const handleCategoryChange = (category) => {
        const categoryValue = category.target.value;
        if (favoriteCategories.includes(categoryValue)) {
            setFavoriteCategories(favoriteCategories.filter(item => item !== categoryValue));
        } else {
            setFavoriteCategories([...favoriteCategories, categoryValue]);
        }
    };

    const handleColorChange = (colour) => {
        const colorValue = colour.target.value;
        if (favoriteColor.includes(colorValue)) {
            setFavoriteColor(favoriteColor.filter(item => item !== colorValue));
        } else {
            setFavoriteColor([...favoriteColor, colorValue]);
        }
    };

    const handleAge = (e) => {
        setAge(e.target.value);
        setErrEmail("");
    };

    const handleGender = (e) => {
        setGender(e.target.value);
        setErrPassword("");
    };
    // ============= Event Handler End here ===============
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!age)
            setErrEmail("Enter valid age");
        if (!gender)
            setErrPassword("Create a password");
        // ============== Getting the value ==============
        if (age && gender) {
            setSuccessMsg(
                "Your responses are recorded!"
            );
            setAge("");
            setGender("");
        }
    };
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="w-1/2 hidden lgl:inline-flex h-full text-white">
                <div className="w-[450px] h-full bg-primeColor px-10 flex flex-col gap-6 justify-center">
                    <div className="flex flex-col gap-1 -mt-1">
                        <h1 className="font-titleFont text-2xl font-medium mb-3">
                            Let us know more about you
                        </h1>
                        <p className="text-base">Please answer the question for a personalised and smooth experience.
                        The products will be recommended based on your answers and future interaction</p>
                    </div>
                </div>
            </div>
            <div className="w-full lgl:w-1/2 h-full">
                {successMsg ? (
                    <div className="w-full lgl:w-[500px] h-full flex flex-col justify-center">
                        <p className="w-full px-4 py-10 text-green-500 font-medium font-titleFont">
                            {successMsg}
                        </p>
                        <Link to="/">
                            <button
                                className="w-full h-10 bg-primeColor text-gray-200 rounded-md text-base font-titleFont font-semibold 
            tracking-wide hover:bg-black hover:text-white duration-300"
                            >
                                Visit Store
                            </button>
                        </Link>
                    </div>
                ) : (
                    <form className="w-full lgl:w-[450px] h-screen flex items-center justify-center">
                        <div className="px-6 py-4 w-full h-[90%] flex flex-col justify-center overflow-y-scroll scrollbar-thin scrollbar-thumb-primeColor">
                            <h1 className="font-titleFont underline underline-offset-4 decoration-[1px] font-semibold text-3xl mdl:text-4xl mb-4">
                                More Details
                            </h1>
                            <div className="flex flex-col gap-3">
                                {/* Age */}
                                <div className="flex flex-col gap-.5">
                                    <p className="font-titleFont text-base font-semibold text-gray-600">
                                        Your Age
                                    </p>
                                    <input
                                        onChange={handleAge}
                                        value={age}
                                        className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                                        type="number"
                                        placeholder="18"
                                    />
                                    {errEmail && (
                                        <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                                            <span className="font-bold italic mr-1">!</span>
                                            {errEmail}
                                        </p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div className="flex flex-col gap-.5">
                                    <p className="font-titleFont text-base font-semibold text-gray-600">
                                        Your Gender
                                    </p>
                                    <select
                                        onChange={handleGender}
                                        value={gender}
                                        className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="others">Others</option>
                                    </select>
                                    {errPassword && (
                                        <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                                            <span className="font-bold italic mr-1">!</span>
                                            {errPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Favorite Color */}
                                <div className="flex flex-col gap-.5">
                                    <p className="font-titleFont text-base font-semibold text-gray-600">
                                        Your Favorite Color
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {colorOptions.map(color => (
                                            <div className="flex items-start mdl:items-center gap-2">
                                                <input
                                                    checked={favoriteColor.includes(color.value)}
                                                    onChange={handleColorChange}
                                                    className="w-4 h-4 mt-1 mdl:mt-0 cursor-pointer"
                                                    type="checkbox"
                                                    value={color.value}
                                                />
                                                <p className="text-sm text-primeColor">
                                                    {color.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Favorite Category */}
                                <div className="flex flex-col gap-.5">
                                    <p className="font-titleFont text-base font-semibold text-gray-600">
                                        Your Favorite Color
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {categoryOptions.map(category => (
                                            <div className="flex items-start mdl:items-center gap-2">
                                                <input
                                                    checked={favoriteCategories.includes(category.value)}
                                                    onChange={handleCategoryChange}
                                                    className="w-4 h-4 mt-1 mdl:mt-0 cursor-pointer"
                                                    type="checkbox"
                                                    value={category.value}
                                                />
                                                <p className="text-sm text-primeColor">
                                                    {category.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="bg-primeColor hover:bg-black text-gray-200 hover:text-white cursor-pointer w-full text-base font-medium h-10 rounded-md  duration-300"
                                >
                                    Submit
                                </button>

                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MoreDetails;
