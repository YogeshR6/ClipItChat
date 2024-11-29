"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  userSignInWithEmailAndPassword,
  userSignInWithGoogle,
} from "@/utils/authFunctions";
import { FcGoogle } from "react-icons/fc";

const AuthPage: React.FC = () => {
  const [formType, setFormType] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleUserLogin = () => {
    userSignInWithEmailAndPassword(formData.email, formData.password);
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserSignUpWithGoogle = () => {
    const userSignUpWithGoogleResult = userSignInWithGoogle();
    console.log(userSignUpWithGoogleResult);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <h1>Auth Page</h1>
      <div className="flex flex-col justify-center items-center gap-5 w-max">
        <Input
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleFormDataChange}
          required
        />
        <Input
          id="password"
          placeholder="Password"
          value={formData.email}
          onChange={handleFormDataChange}
          required
        />
        <div className="flex gap-5">
          <Button onClick={handleUserLogin}>Login</Button>
          <Button variant="outline" onClick={handleUserSignUpWithGoogle}>
            <FcGoogle /> Login with Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
