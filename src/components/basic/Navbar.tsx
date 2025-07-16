import { Zap } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

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
      <div className="flex gap-10 ">
        <div className="dashboard">
          <Button variant={"default"}>History</Button>
        </div>
        <div className="auth">
        <Button variant={"default"}>
          Add
        </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
