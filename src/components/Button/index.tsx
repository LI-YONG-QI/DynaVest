import React from "react";

interface ButtonProps {
  onClick: () => void;
  text: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const Button = ({ onClick, text, icon, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer flex items-center justify-center gap-2.5 rounded-lg bg-[#5F79F1] text-white py-3.5 px-5 disabled:opacity-50"
      disabled={disabled}
    >
      {icon}
      <span className="text-sm font-semibold">{text}</span>
    </button>
  );
};

export default Button;
