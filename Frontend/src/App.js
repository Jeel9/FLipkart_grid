import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  Route,
  ScrollRestoration,
} from "react-router-dom";

import FooterBottom from "./components/home/Footer/FooterBottom";
import Header from "./components/home/Header/Header";
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import Logout from "./pages/Account/Logout";
import MoreDetails from "./pages/Account/MoreDetails";
import Cart from "./pages/Cart/Cart";
import Home from "./pages/Home/Home";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Shop from "./pages/Shop/Shop";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useCallback, useState } from "react";

const Layout = () => {
  return (
    <div>
      <Header />
      <ScrollRestoration />
      <Outlet />
      <FooterBottom />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />}></Route>
        <Route path="/shop" element={<Shop />}></Route>
        <Route path="/product/:_id" element={<ProductDetails />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
        <Route path="/orderhistory" element={<OrderHistory />}></Route>
      </Route>
      <Route path="/signup" element={<SignUp />}></Route>
      <Route path="/signin" element={<SignIn />}></Route>
      <Route path="/logout" element={<Logout />}></Route>
      <Route path="/moredetails" element={<MoreDetails />}></Route>
    </Route>
  )
);

function App() {
  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
