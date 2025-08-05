import React, { useState } from 'react';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="copy-button-wrapper">
      <button onClick={handleCopy} className="copy-button" aria-label="Copy to clipboard">
        <i className="fa-regular fa-copy"></i>
      </button>
      {copied && <span className="copy-tooltip">Скопировано!</span>}
    </div>
  );
} 