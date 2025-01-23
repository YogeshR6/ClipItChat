"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  userSignInWithEmailAndPassword,
  userSignInWithGoogle,
} from "@/utils/authFunctions";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

const AuthPage: React.FC = () => {
  const [formType, setFormType] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const router = useRouter();

  const handleUserLogin = async () => {
    try {
      const userSignInWithEmailAndPasswordResult =
        await userSignInWithEmailAndPassword(formData.email, formData.password);
      if (userSignInWithEmailAndPasswordResult) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserSignUpWithGoogle = async () => {
    try {
      const userSignUpWithGoogleResult = await userSignInWithGoogle();
      if (userSignUpWithGoogleResult) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <h1>Auth Page</h1>
      <div className="flex flex-col justify-center items-center gap-5 w-max">
        <Input
          id="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleFormDataChange}
          required
        />
        <Input
          id="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleFormDataChange}
          required
        />
        <div className="flex gap-5">
          <Button onClick={handleUserLogin}>Login</Button>
          <Button variant="outline" onClick={handleUserSignUpWithGoogle}>
            <FcGoogle /> Login with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
