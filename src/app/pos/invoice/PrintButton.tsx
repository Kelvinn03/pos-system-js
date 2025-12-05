"use client";

import { useState } from "react";

export default function PrintButton() {
  const [printing, setPrinting] = useState(false);

  function handlePrint() {
    try {
      setPrinting(true);
      // Give the browser a moment to update UI before print
      setTimeout(() => {
        window.print();
        setPrinting(false);
      }, 50);
    } catch {
      setPrinting(false);
    }
  }

  return (
    <button className="btn btn-outline-primary" onClick={handlePrint} disabled={printing}>
      {printing ? "Printing..." : "Print Invoice"}
    </button>
  );
}
