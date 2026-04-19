import React from "react";
export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black font-display tracking-tight uppercase">{title}</h1>
      <div className="p-20 bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800 flex items-center justify-center">
         <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">System Module: {title} is currently under synchronization...</p>
      </div>
    </div>
  );
}
