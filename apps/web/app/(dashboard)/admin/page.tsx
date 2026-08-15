"use client";

import { DashboardSidebar, StatsElement } from "@/components";
import React from "react";
import {
  FaArrowUp,
  FaUsers,
  FaChartLine,
  FaBox,
} from "react-icons/fa6";

const AdminDashboardPage = () => {
  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />

      <div className="flex flex-col items-center ml-5 gap-y-4 w-full max-xl:ml-0 max-xl:px-2 max-xl:mt-5 max-md:gap-y-1">
        <div className="flex justify-between gap-4 w-full max-md:flex-col max-md:w-full max-md:gap-y-2">
          <StatsElement
            title="Total Fishnet Sellers"
            value="245"
            icon={FaUsers}
            trend="+12.5%"
          />

          <StatsElement
            title="Active Fishnet Listings"
            value="1,240"
            icon={FaBox}
            trend="+8.3%"
          />

          <StatsElement
            title="Monthly Fishnet Sales"
            value="$84,500"
            icon={FaChartLine}
            trend="+18.7%"
          />
        </div>

        <div className="w-full bg-blue-500 text-white min-h-40 flex flex-col justify-center items-center gap-y-2 px-4 text-center">
          <h4 className="text-3xl text-gray-100 max-[400px]:text-2xl">
            fishnet Fishnet Marketplace Stats
          </h4>

          <p className="text-3xl font-bold">
            Growing Daily
          </p>

          <p className="text-green-300 flex gap-x-1 items-center">
            <FaArrowUp />
            Connecting fishnet buyers & sellers
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
