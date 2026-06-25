const Logo = () => {
  return (
    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
      
      {/* GSIF TEXT */}
      <span
        className="
        text-[#00ff88] text-2xl md:text-3xl font-black tracking-wide
        "
        style={{ lineHeight: "1" }}
      >
        GSIF
      </span>

      {/* RIGHT TEXT */}
      <div className="flex flex-col justify-center leading-tight">
        <span className="text-[10px] md:text-xs font-bold uppercase text-slate-700 dark:text-white">
          Research
        </span>
        <span className="text-[10px] md:text-xs font-bold uppercase text-slate-700 dark:text-white">
          Network
        </span>
      </div>
    </div>
  );
};

export default Logo;