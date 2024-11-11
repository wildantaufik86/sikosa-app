// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#35A7FF] text-white py-6 font-jakarta">
      <div className="container mx-auto px-6 lg:px-20 flex flex-col md:flex-row justify-between items-start">
        {/* Left Section (MyApp, Address, and Social Media) */}
        <div className="flex flex-col items-start space-y-4 mb-6 md:mb-0 w-full lg:w-9/12">
          <div>
            <h2 className="font-bold text-xl">Sikosa</h2>
          </div>
          <div>
            <p className="text-sm font-semibold">123 Web Avenue, Suite 101</p>
            <p className="text-sm font-semibold">City, Country</p>
          </div>
          {/* Social Media and WhatsApp */}
          <div className="flex space-x-6 items-center">
            <Link to="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook className="hover:text-blue-500 text-xl" />
            </Link>
            <Link to="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram className="hover:text-pink-500 text-xl" />
            </Link>
            <Link to="https://wa.me/1234567890" target="_blank" rel="noreferrer">
              <FaWhatsapp className="hover:text-green-500 text-xl" />
            </Link>
          </div>
        </div>

        {/* Right Section (Contact Info) */}
        <div className="text-sm text-start lg:text-start w-full lg:pl-10 lg:w-3/12 lg:mt-0 mt-5">
          <h3 className="font-bold text-xl mb-3">Contact</h3>
          <p className="mb-3">
            Phone:{" "}
            <Link to="tel:+1234567890" className="hover:underline">
              +1 234 567 890
            </Link>
          </p>
          <p className="mb-3">
            Email:{" "}
            <Link to="mailto:info@myapp.com" className="hover:underline">
              info@myapp.com
            </Link>
          </p>
          <p>
            Support:{" "}
            <Link to="tel:+0987654321" className="hover:underline">
              +0 987 654 321
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-6 border-t border-white pt-4 text-sm font-semibold text-white text-center">© Sikosa all rights 2024 - Designed by</div>
    </footer>
  );
};

export default Footer;
