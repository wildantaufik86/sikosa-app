import React, { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your appointment has been confirmed.",
      date: "November 13, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 2,
      message: "New message from Dr. Smith.",
      date: "November 12, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 3,
      message: "Your profile was updated successfully.",
      date: "November 10, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 4,
      message: "Your order has shipped.",
      date: "November 9, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 5,
      message: "Appointment reminder: Dr. Jones tomorrow.",
      date: "November 8, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 6,
      message: "New promotional offer just for you!",
      date: "November 7, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 7,
      message: "System maintenance scheduled for next week.",
      date: "November 6, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: false,
    },
    {
      id: 8,
      message: "Your subscription will expire in 3 days.",
      date: "November 5, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: true,
    },
    {
      id: 9,
      message: "New message from the support team.",
      date: "November 4, 2024",
      imageUrl: "/assets/caroulsel1.png",
      isNew: false,
    },
    // Add more notifications as needed
  ]);

  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 8; // Change this to 8

  const handleNotificationClick = (id, isNew) => {
    if (isNew || selectedNotificationId !== id) {
      setSelectedNotificationId((prevId) => (prevId === id ? null : id));
    }
  };

  const markAsDone = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, isNew: false }
          : notification
      )
    );
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  return (
    <div className="mt-14 lg:mt-10 mx-auto bg-white lg:mr-10">
      {/* Title with Bottom Border */}
      <h1 className="text-xl font-semibold mb-4 pb-2 border-b border-black">
        Notifications
      </h1>

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
        {currentNotifications.map((notification) => (
          <div
            key={notification.id}
            className="p-2 bg-gray-100 rounded-lg shadow-sm cursor-pointer"
            onClick={() =>
              handleNotificationClick(notification.id, notification.isNew)
            }
          >
            <div className="flex items-center">
              {/* Blue Dot for New Notifications */}
              {notification.isNew && (
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              )}

              {/* Notification Icon/Image */}
              <img
                src={notification.imageUrl}
                alt="Notification Icon"
                className="w-10 h-10 mr-4 object-cover"
              />

              {/* Notification Content */}
              <div className="flex-1">
                <p className="text-gray-800">{notification.message}</p>
              </div>

              {/* Notification Date */}
              <p className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                {notification.date}
              </p>
            </div>

            {/* Buttons displayed only if the notification is selected */}
            {selectedNotificationId === notification.id && (
              <div className="flex space-x-2 mt-4">
                {/* Reply button is always visible if the notification is selected */}
                <button className="px-2 py-1 text-xs font-semibold text-white bg-[#35A7FF] rounded hover:bg-blue-600">
                  Reply
                </button>
                {/* Mark as Done button only appears if the notification is new */}
                {notification.isNew && (
                  <button
                    onClick={() => markAsDone(notification.id)}
                    className="px-2 py-1 text-xs font-semibold text-white bg-[#35A7FF] rounded hover:bg-green-600"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination with Outer Border and Centered */}
      <div className="border border-[#2B79D3] rounded-full mt-6 mx-auto w-max">
        <div className="flex justify-center space-x-2 p-1">
          {/* Left Arrow Button */}
          <button
            className="px-3 py-1"
            onClick={() => paginate(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <IoIosArrowBack className="text-[#2B79D3]" />
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages).keys()].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 ${
                currentPage === index + 1
                  ? "bg-[#2B79D3] rounded-full text-white"
                  : "border-gray-400"
              }`}
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
    </div>
  );
};

export default NotificationPage;
