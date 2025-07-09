import { UserButton } from "@clerk/nextjs";
import React from "react";

function Header() {
  return (
    <div className="flex justify-end p-2 shadow-md">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: {
              width: "2.5rem",
              height: "2.5rem",
            },
            userButtonTrigger: {
              "&:focus, &:active": {
                boxShadow: "none",
              },
            },
          },
        }}
      />
    </div>
  );
}

export default Header;
