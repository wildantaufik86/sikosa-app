import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../components/user/components/daftar-layanan/BreadCrumb";
import TitleAndDescription from "../../../components/user/components/daftar-layanan/TitleDescription";
import ServiceCard from "../../../components/user/components/daftar-layanan/ServiceCard";
import ServicePagination from "../../../components/user/components/daftar-layanan/PaginationService";
import { getAllPsikolog } from "../../../utils/api";
import { useAuth } from "../../../hooks/hooks";

const Service = () => {
  const { authUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;
  const [psikologs, setPsikologs] = useState([]);

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = psikologs.slice(
    indexOfFirstService,
    indexOfLastService
  );

  // dummy data psikolog when user not log in
  const dummyPsikologs = [
    {
      profile: {
        picture: "/assets/login.png",
        fullname: "psikolog",
        description: "",
        educationBackground: [],
        specialization: "psikolog",
      },
      id: "1",
      email: "",
      nim: "",
      verified: false,
      role: "psikolog",
      __v: 1,
    },
    {
      profile: {
        picture: "/assets/login.png",
        fullname: "psikolog",
        description: "",
        educationBackground: [],
        specialization: "psikolog",
      },
      id: "2",
      email: "",
      nim: "",
      verified: false,
      role: "psikolog",
      __v: 1,
    },
    {
      profile: {
        picture: "/assets/login.png",
        fullname: "psikolog",
        description: "",
        educationBackground: [],
        specialization: "psikolog",
      },
      id: "3",
      email: "",
      nim: "",
      verified: false,
      role: "psikolog",
      __v: 1,
    },
    {
      profile: {
        picture: "/assets/login.png",
        fullname: "psikolog",
        description: "",
        educationBackground: [],
        specialization: "psikolog",
      },
      id: "4",
      email: "",
      nim: "",
      verified: false,
      role: "psikolog",
      __v: 1,
    },
  ];

  useEffect(() => {
    const fetchPsikologs = async () => {
      try {
        const response = await getAllPsikolog();
        if (response.error) {
          throw new Error("Failed to get psikologs");
        }
        const validatedPsikologs = response.psikologs.filter((data) => {
          return (
            data.profile.picture !== "" &&
            data.profile.fullname !== "" &&
            data.profile.description !== "" &&
            data.profile.specialization !== "" &&
            data.profile.educationBackground.length !== 0
          );
        });
        setPsikologs(validatedPsikologs);
      } catch (error) {
        console.log(error.message);
      }
    };
    if (authUser) {
      fetchPsikologs();
    } else {
      setPsikologs(dummyPsikologs);
    }
  }, []);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage < Math.ceil(psikologs.length / servicesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="py-8 lg:py-10 px-6 lg:px-20 font-jakarta">
      <Breadcrumb />
      <TitleAndDescription />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {currentServices.map((data, index) => (
          <ServiceCard key={index} data={data} index={index} />
        ))}
      </div>
      <ServicePagination
        currentPage={currentPage}
        totalPages={Math.ceil(psikologs.length / servicesPerPage)}
        prevPage={prevPage}
        nextPage={nextPage}
        paginate={paginate}
      />
    </div>
  );
};

export default Service;
