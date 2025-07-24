import { Zap } from "lucide-react";
import React from "react";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import UserProfileButton from "../auth/UserProfileButton";
import { SignInButton } from "../auth/SignInButton";
import { SignUpButton } from "../auth/SignUpButton";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center">
      {/* Logo , history and auth  */}

      <div className="logo">
        <p className="font-bebas text-[36px] font-semibold flex justify-center items-center gap-1">
          Synoptic{" "}
          <span>
            <Zap size={30} fill="yellow" />
          </span>
        </p>
      </div>

      <div className="auth   ">
        <SignedIn>
          <UserProfileButton />
        </SignedIn>
        <SignedOut>
          <div className="flex  gap-2">
            <SignInButton />
            <SignUpButton />
          </div>
        </SignedOut>
      </div>
    </div>
  );
};

export default Navbar;
