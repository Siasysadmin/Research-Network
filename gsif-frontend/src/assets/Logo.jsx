const Logo = () => {
  return (
    <div className="flex items-center leading-none cursor-pointer">
      <span
        className="text-[#00ff88] text-3xl font-black mr-3"
        style={{ lineHeight: "1" }}
      >
        GSIF
      </span>
      <div className="flex flex-col justify-center">
        <span className="text-white text-xs font-bold uppercase">Research</span>
        <span className="text-white text-xs font-bold uppercase">Network</span>
      </div>
    </div>
  );
};

export default Logo;
