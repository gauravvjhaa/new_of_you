// src/components/shopping-view/ShoppingLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import ShoppingHeader from "./ShoppingHeader"; // Adjust the path if needed

function ShoppingLayout() {
  return (
    <>
      <ShoppingHeader />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default ShoppingLayout;
