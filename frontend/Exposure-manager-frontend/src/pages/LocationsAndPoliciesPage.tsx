import React, { useState } from "react";
import AppWrapper from "../components/AppWrapper";
import LocationTable from "./LocationPage";
import PolicyTable from "./PolicyPage";

const LocationsAndPoliciesPage = () => {
  const [activeTab, setActiveTab] = useState<"locations" | "policies">("locations");

  return (
    <AppWrapper>
      <div>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab("locations")}
            className={`px-4 py-2 rounded transition-colors duration-200 border`}
            style={{
              backgroundColor: activeTab === "locations" ? "var(--primary-color)" : "var(--card-bg)",
              color: activeTab === "locations" ? "var(--text-color)" : "var(--text-color)",
              borderColor: "var(--primary-color)",
            }}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded transition-colors duration-200 border`}
            style={{
              backgroundColor: activeTab === "policies" ? "var(--primary-color)" : "var(--card-bg)",
              color: activeTab === "policies" ? "var(--text-color)" : "var(--text-color)",
              borderColor: "var(--primary-color)",
            }}
          >
            Policies
          </button>
        </div>

        <div className="w-full h-[85vh]">
          {activeTab === "locations" ? <LocationTable /> : <PolicyTable />}
        </div>
      </div>
    </AppWrapper>
  );
};

export default LocationsAndPoliciesPage;
