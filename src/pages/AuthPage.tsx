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
import { handleUserSignUpAddToCollection } from "@/utils/userFunctions";

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

  const handleUserLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.password || !formData.email) {
      setError("Please fill all fields");
      return;
    }
    try {
      const { user } = await userSignInWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (user) {
        router.push("/");
      }
    } catch (error) {
      handleAuthError(error);
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
      const { user } = await userSignInWithGoogle();
      if (user?.email) {
        const userSignUpResponse = await handleUserSignUpAddToCollection(
          user.email
        );
        if (userSignUpResponse) router.push("/");
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleUserSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.password || !formData.email || !formData.passwordConfirm) {
      setError("Please fill all fields");
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const { user } = await userSignUpWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (user?.email) {
        const userSignUpResponse = await handleUserSignUpAddToCollection(
          user.email
        );
        if (userSignUpResponse) router.push("/");
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error: any) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        setError("Email is already in use. Please try logging in.");
        break;
      case "auth/invalid-email":
        setError("Invalid email address. Please check your input.");
        break;
      case "auth/user-not-found":
        setError("No account found with this email. Please sign up first.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password. Please try again.");
        break;
      case "auth/weak-password":
        setError("Password is too weak. Use at least 6 characters.");
        break;
      case "auth/invalid-credential":
        setError("Invalid credentials. Please check your email and password.");
        break;
      case "auth/network-request-failed":
        setError("Network error. Please check your internet connection.");
        break;
      case "auth/too-many-requests":
        setError("Too many failed attempts. Please try again later.");
        break;
      default:
        setError("An unexpected error occurred. Please try again.");
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
        <form
          onSubmit={formType === "login" ? handleUserLogin : handleUserSignUp}
          className="flex flex-col gap-3 w-full"
        >
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
                <Button type="submit" className="w-1/2">
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
                <Button type="submit" className="w-1/2">
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
          <Button
            type="button"
            variant="outline"
            onClick={handleUserSignUpWithGoogle}
          >
            <FcGoogle /> Login with Google
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
