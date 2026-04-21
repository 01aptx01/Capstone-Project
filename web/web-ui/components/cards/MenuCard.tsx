"use client";

import { useState } from "react";
import { MenuItem } from "@/lib/constants";
import { BaoImage } from "./BaoImage";
import { COLORS } from "@/lib/constants";

export function MenuCard({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);

  const handleBook = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="h-44 w-full overflow-hidden">
        <BaoImage item={item} />
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-base">{item.name}</h3>
        <p className="text-sm mt-0.5" style={{ color: COLORS.gray }}>
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg" style={{ color: COLORS.accent }}>
            {item.price} B
          </span>
          <button
            onClick={handleBook}
            className="px-5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
            style={
              added
                ? {
                    backgroundColor: COLORS.accent,
                    borderColor: COLORS.accent,
                    color: "white",
                  }
                : {
                    backgroundColor: "white",
                    borderColor: COLORS.accent,
                    color: COLORS.accent,
                  }
            }
          >
            {added ? "✓ จองแล้ว" : "จอง"}
          </button>
        </div>
      </div>
    </div>
  );
}