const KategoriArtikel = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex flex-col items-start justify-between mb-5 space-y-2">
      <h1 className="text-xl lg:text-2xl font-bold text-black mb-4 md:mb-0">Artikel Terbaru dan Terkait</h1>
      <div className="flex space-x-4">
        <button
          className={`font-medium ${selectedCategory === "Semua" ? "text-[#35A7FF]" : "text-black"}`}
          onClick={() => setSelectedCategory("Semua")}
        >
          Semua
        </button>
        <button
          className={`font-medium ${selectedCategory === "Terbaru" ? "text-[#35A7FF]" : "text-black"}`}
          onClick={() => setSelectedCategory("Terbaru")}
        >
          Terbaru
        </button>
      </div>
    </div>
  );
};

export default KategoriArtikel;
