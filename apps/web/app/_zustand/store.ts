import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProductInCart = {
  id: string;
  title: string;
  price: number;
  image: string;
  amount: number;
  merchantId: string;
  sellerName: string; // Added seller name for display
};

export type State = {
  products: ProductInCart[];
};

export type Actions = {
  addToCart: (newProduct: ProductInCart) => void;
  removeFromCart: (id: string) => void;
  updateCartAmount: (id: string, quantity: number) => void;
  clearCart: () => void;
};

// Getter functions for derived state
const getAllQuantity = (products: ProductInCart[]) => {
  return products.reduce((sum, item) => sum + item.amount, 0);
};

const getTotal = (products: ProductInCart[]) => {
  return products.reduce((sum, item) => sum + (item.amount * item.price), 0);
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set) => ({
      products: [],
      addToCart: (newProduct) => {
        set((state) => {
          const existingItemIndex = state.products.findIndex(
            (item) => item.id === newProduct.id
          );
          if (existingItemIndex === -1) {
            // Item not in cart, add it
            return {
              products: [...state.products, newProduct]
            };
          } else {
            // Item already in cart, update its amount
            const updatedProducts = [...state.products];
            updatedProducts[existingItemIndex] = {
              ...updatedProducts[existingItemIndex],
              amount: updatedProducts[existingItemIndex].amount + newProduct.amount
            };
            return { products: updatedProducts };
          }
        });
      },
      removeFromCart: (id) => {
        set((state) => {
          return {
            products: state.products.filter(item => item.id !== id)
          };
        });
      },
      updateCartAmount: (id, amount) => {
        set((state) => {
          const existingItemIndex = state.products.findIndex(
            (item) => item.id === id
          );
          if (existingItemIndex === -1) {
            // Item not found, do nothing
            return state;
          } else {
            // Update the amount
            const updatedProducts = [...state.products];
            updatedProducts[existingItemIndex] = {
              ...updatedProducts[existingItemIndex],
              amount: amount
            };
            return { products: updatedProducts };
          }
        });
      },
      clearCart: () => {
        set({
          products: []
        });
      }
    }),
    {
      name: "products-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// Derived state selectors (can be used in components)
export const useCartQuantity = () => {
  const products = useProductStore(state => state.products);
  return getAllQuantity(products);
};

export const useCartTotal = () => {
  const products = useProductStore(state => state.products);
  return getTotal(products);
};

export const useCartProducts = () => {
  return useProductStore(state => state.products);
};