import React, { createContext, useContext, useState } from "react";

const BuyerContext = createContext(null);

export function BuyerProvider({ children }) {
  const stored = localStorage.getItem("sakhi_buyer");
  const [buyer, setBuyer] = useState(stored ? JSON.parse(stored) : null);

  const loginBuyer = (name, phone) => {
    const data = { name, phone };
    localStorage.setItem("sakhi_buyer", JSON.stringify(data));
    setBuyer(data);
  };

  const logoutBuyer = () => {
    localStorage.removeItem("sakhi_buyer");
    setBuyer(null);
  };

  return (
    <BuyerContext.Provider value={{ buyer, loginBuyer, logoutBuyer }}>
      {children}
    </BuyerContext.Provider>
  );
}

export const useBuyer = () => useContext(BuyerContext);
