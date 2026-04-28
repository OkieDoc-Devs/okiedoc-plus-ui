import React, { createContext, useState, useContext } from "react";
import { DiyModal } from "../components/DiyModal";

// 1. Create the Context
const ModalContext = createContext();

// 2. Create the Provider Component
export default function ModalProvider({ children }) {
  const [diyAction, setDiyAction] = useState(null);

  const openDiyModal = (actionName) => {
    setDiyAction(actionName);
  };

  const closeDiyModal = () => {
    setDiyAction(null);
  };

  return (
    <ModalContext.Provider value={{ openDiyModal, closeDiyModal }}>
      {/* Renders your entire App */}
      {children}

      {/* The Universal Modal lives here, at the absolute top level! */}
      <DiyModal
        isOpen={diyAction !== null}
        onClose={closeDiyModal}
        actionName={diyAction}
      />
    </ModalContext.Provider>
  );
}

// 3. Create a custom hook to easily use the modal anywhere
export const useModal = () => {
  return useContext(ModalContext);
};
