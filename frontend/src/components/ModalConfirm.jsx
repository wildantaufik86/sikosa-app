import { IoWarning } from "react-icons/io5";

const ModalConfirm = ({ message, isOpen, confirmHandle, cancelHandle }) => {
  return (
    <div
      className={`fixed inset-y-0 inset-x-0 justify-center items-center bg-black z-20 bg-opacity-20 ${
        isOpen ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white w-[60%] md:w-[40%] rounded-md flex flex-col items-center gap-4 p-4">
        <IoWarning className="text-orange-400 text-6xl" />
        <h4 className="font-semibold text-sm">{message}</h4>
        <div className="flex items-center gap-4">
          <button
            onClick={confirmHandle}
            className="text-xs py-1 px-2 bg-red-500 rounded-md text-white font-semibold cursor-pointer transition hover:bg-red-700"
          >
            Hapus
          </button>
          <button
            onClick={cancelHandle}
            className="text-xs py-1 px-2 bg-slate-500 rounded-md text-white font-semibold cursor-pointer transition hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
