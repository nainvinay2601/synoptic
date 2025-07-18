"use client"
import { useAuth, UserButton } from "@clerk/nextjs";
import { SignInButton } from "./SignInButton";

const UserProfileButton = () => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <UserButton /> : <SignInButton />;
};

export default UserProfileButton;
