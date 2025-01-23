"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  userSignInWithEmailAndPassword,
  userSignInWithGoogle,
  userSignUpWithEmailAndPassword,
} from "@/utils/authFunctions";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AuthPage: React.FC = () => {
  const [formType, setFormType] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState({
    password: false,
    passwordConfirm: false,
  });

  const router = useRouter();

  const handleUserLogin = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.email) {
      setError("Please fill all fields");
      return;
    }
    try {
      const userSignInWithEmailAndPasswordResult =
        await userSignInWithEmailAndPassword(formData.email, formData.password);
      if (userSignInWithEmailAndPasswordResult) {
        router.push("/");
      }
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (
      e.target.name === "passwordConfirm" &&
      formData.password !== e.target.value
    ) {
      setError("Passwords do not match");
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserSignUpWithGoogle = async () => {
    try {
      const userSignUpWithGoogleResult = await userSignInWithGoogle();
      if (userSignUpWithGoogleResult) {
        setError("");
        router.push("/");
      }
    } catch (error) {
      setError("Something went wrong!");
    }
  };

  const handleUserSignUp = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.email) {
      setError("Please fill all fields");
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userSignUpWithEmailAndPasswordResult =
        await userSignUpWithEmailAndPassword(formData.email, formData.password);
      if (userSignUpWithEmailAndPasswordResult) {
        router.push("/");
      }
    } catch (error) {
      setError("Something went wrong!");
    }
  };

  const handleFormTypeChange = () => {
    setFormType(formType === "login" ? "signup" : "login");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <h1>Auth Page</h1>
      <div className="flex flex-col justify-center items-center gap-1 w-max min-w-[300px]">
        <h1>{formType === "login" ? "Login" : "Sign up"}</h1>
        <form onSubmit={handleUserLogin} className="flex flex-col gap-3 w-full">
          <Input
            id="email"
            placeholder="Email*"
            name="email"
            value={formData.email}
            onChange={handleFormDataChange}
          />
          <Input
            id="password"
            placeholder="Password*"
            name="password"
            value={formData.password}
            onChange={handleFormDataChange}
            type={showPassword.password ? "text" : "password"}
            icon={showPassword.password ? FaEyeSlash : FaEye}
            onIconClick={() => {
              setShowPassword({
                ...showPassword,
                password: !showPassword.password,
              });
            }}
          />
          {formType === "signup" && (
            <Input
              id="passwordConfirm"
              placeholder="Confirm Password*"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleFormDataChange}
              type={showPassword.passwordConfirm ? "text" : "password"}
              icon={showPassword.passwordConfirm ? FaEyeSlash : FaEye}
              onIconClick={() => {
                setShowPassword({
                  ...showPassword,
                  passwordConfirm: !showPassword.passwordConfirm,
                });
              }}
            />
          )}
          <p
            className="text-red-500"
            style={{ visibility: error ? "visible" : "hidden" }}
          >
            {error}
          </p>
          <div className="flex gap-5 w-full justify-center items-center">
            {formType === "signup" ? (
              <>
                <Button
                  onClick={handleUserSignUp}
                  type="submit"
                  className="w-1/2"
                >
                  Sign up
                </Button>
                <Button
                  onClick={handleFormTypeChange}
                  variant="outline"
                  className="w-1/2"
                  type="button"
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleUserLogin}
                  type="submit"
                  className="w-1/2"
                >
                  Login
                </Button>
                <Button
                  onClick={handleFormTypeChange}
                  variant="outline"
                  className="w-1/2"
                  type="button"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={handleUserSignUpWithGoogle}>
            <FcGoogle /> Login with Google
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
