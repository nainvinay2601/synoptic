"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "../ui/button";


export const  SignUpButton = ()=>{
    const {openSignUp} = useClerk();

    return(
        <Button variant={"default"} onClick={()=> openSignUp()}> 
            Sign Up
        </Button>
    )

}