import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { getRiskColor } from "@/utils";
import type { StrategyMetadata } from "@/types";
import InvestmentForm from "./InvestmentForm";

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: StrategyMetadata;
}

export default function InvestModal({
  isOpen,
  onClose,
  strategy,
}: InvestModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset closing state when modal opens
  useEffect(() => {
    const body = document.body;
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - body.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      // Delay removing styles to allow for closing animation
      setTimeout(() => {
        body.style.paddingRight = "";
        body.style.overflow = "";
      }, 300);
    }

    // Cleanup on unmount
    return () => {
      body.style.paddingRight = "";
      body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with the CSS transition duration
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "rgba(200, 200, 200, 0.6)" }}
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto transition-all duration-300 ${
            isClosing
              ? "opacity-0 transform scale-95"
              : "opacity-100 transform scale-100"
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-transparent border-black border-solid border-2 rounded-full p-1 hover:bg-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Invest modal header */}
          <div className="p-6">
            <div className="flex items-start mb-6">
              {/* Strategy icon (spans 2 rows) */}
              <div className="mr-4">
                <Image
                  src={`/crypto-icons/chains/${strategy.chainId}.svg`}
                  alt={strategy.title}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
              </div>

              <div className="flex-1">
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {strategy.title}
                </h3>

                {/* APY and Risk on same row */}
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-medium text-gray-900">
                    APY {strategy.apy}%
                  </div>
                  <div
                    className="px-2 py-1 rounded-lg text-sm font-medium capitalize"
                    style={{
                      backgroundColor: getRiskColor(strategy.risk).bg,
                      color: getRiskColor(strategy.risk).text,
                    }}
                  >
                    {strategy.risk} Risk
                  </div>
                </div>
              </div>
            </div>
            {/* Invest modal content */}
            <div>
              <InvestmentForm strategy={strategy} handleClose={handleClose} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
