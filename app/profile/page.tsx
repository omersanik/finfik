import ProfilePageCardComponent from "@/components/ProfilePageCardComponent";
import React from "react";

const ProfilePage = () => {
  return (
    <div className="flex justify-center min-h-screen w-full px-4 mt-8">
      <div className="w-full max-w-md">
        {" "}
        {/* max-w-md = 448px */}
        <ProfilePageCardComponent />
      </div>
    </div>
  );
};

export default ProfilePage;
