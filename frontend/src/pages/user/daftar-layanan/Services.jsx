import React, { useState } from "react";
import Breadcrumb from "../../../components/user/components/daftar-layanan/BreadCrumb";
import TitleAndDescription from "../../../components/user/components/daftar-layanan/TitleDescription";
import ServiceCard from "../../../components/user/components/daftar-layanan/ServiceCard";
import ServicePagination from "../../../components/user/components/daftar-layanan/PaginationService";

const servicesData = [
  { id: 1, name: "Service 1", image: "https://via.placeholder.com/150" },
  { id: 2, name: "Service 2", image: "https://via.placeholder.com/150" },
  { id: 3, name: "Service 3", image: "https://via.placeholder.com/150" },
  { id: 4, name: "Service 4", image: "https://via.placeholder.com/150" },
  { id: 5, name: "Service 5", image: "https://via.placeholder.com/150" },
  { id: 6, name: "Service 6", image: "https://via.placeholder.com/150" },
  { id: 7, name: "Service 7", image: "https://via.placeholder.com/150" },
  { id: 8, name: "Service 8", image: "https://via.placeholder.com/150" },
  { id: 9, name: "Service 9", image: "https://via.placeholder.com/150" },
  { id: 10, name: "Service 10", image: "https://via.placeholder.com/150" },
  { id: 11, name: "Service 11", image: "https://via.placeholder.com/150" },
  { id: 12, name: "Service 12", image: "https://via.placeholder.com/150" },
  { id: 13, name: "Service 13", image: "https://via.placeholder.com/150" },
  { id: 14, name: "Service 14", image: "https://via.placeholder.com/150" },
  { id: 15, name: "Service 15", image: "https://via.placeholder.com/150" },
  { id: 16, name: "Service 16", image: "https://via.placeholder.com/150" },
];

const Service = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage < Math.ceil(servicesData.length / servicesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="py-8 lg:py-10 px-6 lg:px-20 font-jakarta">
      <Breadcrumb />
      <TitleAndDescription />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {currentServices.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
      <ServicePagination currentPage={currentPage} totalPages={Math.ceil(servicesData.length / servicesPerPage)} prevPage={prevPage} nextPage={nextPage} paginate={paginate} />
    </div>
  );
};

export default Service;
