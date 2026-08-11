"use client";

import React from "react";
import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";

interface SingleProductBtnProps {
  product: {
    id: string;
    title: string;
    price: number;
    mainImage: string;
    merchantId: string;
    merchant?: {
      name: string;
    };
  };
  quantityCount: number;
}

const AddToCartSingleProductBtn = ({
  product,
  quantityCount,
}: SingleProductBtnProps) => {
  const addToCart = useProductStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage,
      amount: quantityCount,
      merchantId: product.merchantId,
      sellerName: product.merchant?.name || "Unknown Seller",
    });

    toast.success("Product added to the cart");
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="btn w-[200px] border border-gray-300 bg-white text-lg font-normal text-blue-500 transition-all ease-in hover:scale-110 hover:border-blue-500 hover:bg-blue-500 hover:text-white max-[500px]:w-full"
    >
      Add to cart
    </button>
  );
};

export default AddToCartSingleProductBtn;

