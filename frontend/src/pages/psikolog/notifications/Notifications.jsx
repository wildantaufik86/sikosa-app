import React, { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import { getNotifications, psikologHandleConcultationRequest } from "../../../utils/api";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { toast } from "react-toastify";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 4;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { error, message, notifications: notifData } = await getNotifications();
      if (error) {
        throw new Error(message);
      }

      setNotifications(notifData.filter((notif) => notif.status === "pending"));
    } catch (error) {
      console.log(error.message);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  return (
    <div className="mt-14 lg:mt-10 mx-auto bg-white lg:mr-10">
      {/* Title with Bottom Border */}
      <h1 className="text-xl font-semibold mb-4 pb-2 border-b border-black">Notifications</h1>

      {/* Back Arrow Icon with Border Circle */}
      <Link to="">
        <div className="mb-6 flex items-center space-x-2">
          <div className="border-2 border-black rounded-full p-1">
            <IoIosArrowBack className="text-black text-xl" />
          </div>
        </div>
      </Link>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.length !== 0 ? (
          currentNotifications.map((data, index) => (
            <NotificationCard key={index} notification={data} fetchNotifications={fetchNotifications} />
          ))
        ) : (
          <p className="text-center">tidak ada notification</p>
        )}
      </div>

      {/* Pagination with Outer Border and Centered */}
      {notifications.length !== 0 && (
        <div className="border border-[#2B79D3] rounded-full mt-6 mx-auto w-max">
          <div className="flex justify-center space-x-2 p-1">
            {/* Left Arrow Button */}
            <button className="px-3 py-1" onClick={() => paginate(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
              <IoIosArrowBack className="text-[#2B79D3]" />
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages).keys()].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 ${currentPage === index + 1 ? "bg-[#2B79D3] rounded-full text-white" : "border-gray-400"}`}
              >
                {index + 1}
              </button>
            ))}

            {/* Right Arrow Button */}
            <button
              className="px-3 py-1"
              onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <IoIosArrowForward className="text-[#2B79D3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationCard = ({ notification, fetchNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  // handle accept
  const handleAcceptConsultationRequest = async () => {
    try {
      const { error, message } = await psikologHandleConcultationRequest(notification.consultationId, { status: "accepted" });
      if (error) {
        throw new Error(message);
      }
      toast.success(message);
      fetchNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // handle reject
  const handleRejectConsultationRequest = async () => {
    try {
      const { error, message } = await psikologHandleConcultationRequest(notification.consultationId, { status: "rejected" });
      if (error) {
        throw new Error(message);
      }
      toast.success(message);
      fetchNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col bg-white shadow-md p-4">
      {/* Header */}
      <div onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center mb-4 cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-800">Consultation Request</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg">{isOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-600">{notification.status}</span>
        </div>
      </div>

      {/* Dropdown Content */}
      <div
        className={`border-t overflow-hidden transition-all duration-300 ease-in-out mt-4 ${isOpen ? "max-h-screen" : "max-h-0"}`}
      >
        <div className="space-y-2 mb-4">
          <p className="text-gray-700">
            <span className="font-medium">Message:</span> Consultation Request from {notification.user.fullname}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {notification.user.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Consultation ID:</span> {notification.consultationId}{" "}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">User ID:</span> {notification.user._id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleRejectConsultationRequest}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
          >
            Reject
          </button>
          <button
            onClick={handleAcceptConsultationRequest}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
