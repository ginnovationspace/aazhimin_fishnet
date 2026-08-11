"use client";

import React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useProductStore } from "@/app/_zustand/store";

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

const BuyNowSingleProductBtn = ({
  product,
  quantityCount,
}: SingleProductBtnProps) => {
  const router = useRouter();

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

    router.push("/checkout");
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="btn w-[200px] border border-blue-500 bg-blue-500 text-lg font-normal text-white transition-all ease-in hover:scale-110 hover:border-blue-500 hover:bg-white hover:text-blue-500 max-[500px]:w-full"
    >
      Buy Now
    </button>
  );
};

export default BuyNowSingleProductBtn;

