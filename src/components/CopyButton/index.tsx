import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";

export default function CopyButton({
  text,
  size,
}: {
  text: string;
  size?: number;
}) {
  const [copied, setCopied] = useState(false);

  const sizeClass = size ? `w-[${size}px] h-[${size}px]` : "w-4 h-4";

  const handleCopy = () => {
    setCopied(true);
    toast.success("Address copied");
    // 2 秒後重置狀態，讓使用者能連續複製多次
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <div className="flex flex-col items-center gap-2 cursor-pointer">
        {copied ? (
          <CopyCheck className={`${sizeClass} text-green-500`} />
        ) : (
          <Copy className={`${sizeClass} text-gray-500`} />
        )}
      </div>
    </CopyToClipboard>
  );
}
