import React, { useEffect, useState } from "react";
import { getHistoryConsultations } from "../../../../utils/api";
import { useAuth } from "../../../../hooks/hooks";
import { formattedDate } from "../../../../utils/utils";

const RiwayatTabel = () => {
  const [historyConsultations, setHistoryConsultations] = useState([]);
  const { authUser } = useAuth();
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const { error, message, consultations } = await getHistoryConsultations();
        if (error) {
          throw new Error(message);
        }
        setHistoryConsultations(consultations);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchConsultations();
  }, []);

  return (
    <div className="overflow-x-auto">
      {historyConsultations.length !== 0 ? (
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-[#EBF6FF]">
            <tr>
              <th className="px-4 py-2 font-medium text-left border-y border-gray-200">No</th>
              <th className="px-4 py-2 font-medium text-left border-y border-gray-200">User</th>
              <th className="px-4 py-2 font-medium text-left border-y border-gray-200">Status</th>
              <th className="px-4 py-2 font-medium text-left border-y border-gray-200">Doktor</th>
              <th className="px-4 py-2 font-medium text-left border-y border-gray-200">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {historyConsultations.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b border-gray-200">{index + 1}</td>
                <td className="px-4 py-2 border-b border-gray-200">{authUser.profile.fullname}</td>
                {item.status === "pending" && (
                  <td className="px-4 py-2 border-b border-gray-200 text-orange-500">{item.status}</td>
                )}
                {item.status === "accepted" && (
                  <td className="px-4 py-2 border-b border-gray-200 text-green-500">{item.status}</td>
                )}
                {item.status === "rejected" && <td className="px-4 py-2 border-b border-gray-200 text-red-500">{item.status}</td>}
                <td className="px-4 py-2 border-b border-gray-200">{item.psychologist.fullname}</td>
                <td className="px-4 py-2 border-b border-gray-200">{formattedDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center">
          <p>Tidak ada riwayat</p>
        </div>
      )}
    </div>
  );
};

export default RiwayatTabel;
