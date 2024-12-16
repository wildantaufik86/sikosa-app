import { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Link } from 'react-router-dom';

const EditUser = () => {
  const [fullname, setFullname] = useState('');
  const [role, setRole] = useState('mahasiswa');

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      fullname: fullname.trim(),
      role,
    };
  };

  return (
    <div className="pt-16 lg:pt-5 flex flex-col">
      {/* Title with Bottom Border */}
      <h1 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">
        Edit User
      </h1>

      <Link to="/admin/user">
        <div className="mb-6 flex items-center space-x-2">
          <div className="border-2 border-black rounded-full p-1">
            <IoIosArrowBack className="text-black text-xl" />
          </div>
        </div>
      </Link>

      <div className="flex-1 mt-4 bg-white shadow-md rounded-md py-2 px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullname" className="font-semibold text-sm">
              Fullname
            </label>
            <input
              type="text"
              id="fullname"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              autoComplete="off"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="font-semibold text-sm">
              Role
            </label>
            <select
              name="role"
              id="role"
              className="outline-none py-2 px-3 text-xs rounded-sm bg-slate-100"
              defaultValue={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="mahasiswa">mahasiswa</option>
              <option value="psikolog">psikolog</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="font-semibold bg-green-500 py-2 px-4 rounded-md text-white text-sm"
            >
              Save
            </button>
            <Link
              to="/admin/user"
              className="font-semibold bg-red-500 py-2 px-4 rounded-md text-white text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
