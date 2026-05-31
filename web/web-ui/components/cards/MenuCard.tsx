"use client";

import { MenuItem } from "@/lib/constants";
import { BaoImage } from "./BaoImage";


export function MenuCard({ item }: { item: MenuItem }) {
  

  return (
    <article className="bg-surface rounded-card overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
      <div className="h-44 w-full overflow-hidden bg-brand-muted">
        <BaoImage item={item} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-base">{item.name}</h3>
        <p className="text-sm mt-0.5 text-muted line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="font-bold text-lg text-brand shrink-0">
            {item.price} ฿
          </span>


        </div>
      </div>
    </article>
  );
}
