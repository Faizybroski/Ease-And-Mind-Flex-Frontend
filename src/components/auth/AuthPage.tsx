import React from "react";
import { LoginSignup } from "../loginSignup/LoginSignup";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <LoginSignup />
      </div>
    </div>
  );
};

export default AuthPage;
