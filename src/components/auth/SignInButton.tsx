"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "../ui/button";


export const  SignInButton = ()=>{
    const {openSignIn} = useClerk();

    return(
        <Button variant={"outline"} onClick={()=> openSignIn()}> 
            Sign In
        </Button>
    )

}