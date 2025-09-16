"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  sendEmailVerificationAgain,
  sendForgotPasswordEmail,
  userSignInWithEmailAndPassword,
  userSignInWithGoogle,
  userSignUpWithEmailAndPassword,
} from "@/utils/authFunctions";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthSegmentControl } from "@/components/ui/tabs";
import { AuthFormType } from "@/types/misc";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheck } from "react-icons/fa6";
import { useAuth } from "@/hooks/contexts/AuthContext";

const AuthSegmentControlTabs = [
  { title: "Login", value: "login" },
  { title: "Sign up", value: "signup" },
];

const AuthPage: React.FC = () => {
  const { isLoggedIn, setAuthStateUpdateCheck } = useAuth();
  const router = useRouter();

  const [formType, setFormType] = useState<AuthFormType>("login");
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
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [showVerificationEmailPopup, setShowVerificationEmailPopup] =
    useState<boolean>(false);
  const [showEmailNotVerifiedPopup, setShowEmailNotVerifiedPopup] =
    useState<boolean>(false);
  const [
    sendVerificationEmailAgainStatus,
    setSendVerificationEmailAgainStatus,
  ] = useState<"idle" | "sending" | "sent">("idle");
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] =
    useState<boolean>(false);
  const [forgotPasswordEmailInput, setForgotPasswordEmailInput] =
    useState<string>("");

  const [lastUsedAuthMethod, setLastUsedAuthMethod] = useState<string>("");

  useEffect(() => {
    const method = localStorage.getItem("lastAuthMethod") || "";
    setLastUsedAuthMethod(method);
  }, []);

  useEffect(() => {
    setError("");
  }, [formType]);

  useEffect(() => {
    if (isLoggedIn === true) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  const handleUserLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.password || !formData.email) {
      setError("Please fill all fields");
      return;
    }
    try {
      setError("");
      setAuthLoading(true);
      const user = await userSignInWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (user) {
        localStorage.setItem("lastAuthMethod", "password");
        setAuthStateUpdateCheck((prev) => !prev);
        router.replace("/");
      } else if (user === false) {
        setShowEmailNotVerifiedPopup(true);
      }
      setAuthLoading(false);
    } catch (error) {
      setAuthLoading(false);
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
      const userSignUpResponse = await userSignInWithGoogle();
      if (userSignUpResponse) {
        localStorage.setItem("lastAuthMethod", "google");
        setAuthStateUpdateCheck((prev) => !prev);
        router.replace("/");
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
      setError("");
      setAuthLoading(true);
      const userSignUpResponse = await userSignUpWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (userSignUpResponse) setShowVerificationEmailPopup(true);
      setAuthLoading(false);
    } catch (error: any) {
      setAuthLoading(false);
      handleAuthError(error);
    }
  };

  const handleSendVerificationAgain = async () => {
    if (sendVerificationEmailAgainStatus === "idle") {
      setSendVerificationEmailAgainStatus("sending");
      const response = await sendEmailVerificationAgain();
      if (response instanceof Error) {
        setSendVerificationEmailAgainStatus("idle");
        setError("An unexpected error occurred. Please try again.");
        return;
      }
      setSendVerificationEmailAgainStatus("sent");
      setTimeout(() => {
        setSendVerificationEmailAgainStatus("idle");
      }, 1000);
    }
  };

  const handleContinueToLogin = (resetPassword: boolean) => {
    setFormType("login");
    setShowEmailNotVerifiedPopup(false);
    setShowVerificationEmailPopup(false);
    if (resetPassword)
      setFormData((prev) => ({ ...prev, password: "", passwordConfirm: "" }));
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordPopup(true);
    setError("");
    setForgotPasswordEmailInput(formData.email || "");
  };

  const handleBackToLogin = () => {
    setShowForgotPasswordPopup(false);
    setForgotPasswordEmailInput("");
    setError("");
  };

  const handleSendForgotPasswordEmail = async () => {
    if (!forgotPasswordEmailInput || forgotPasswordEmailInput === "") {
      setError("Please enter your email.");
      return;
    }
    setSendVerificationEmailAgainStatus("sending");
    setError("");
    const sendForgotPasswordResponse = await sendForgotPasswordEmail(
      forgotPasswordEmailInput
    );
    if (sendForgotPasswordResponse instanceof Error) {
      setError("Error sending reset password email. Please try again!");
      return;
    }
    setSendVerificationEmailAgainStatus("sent");
    setTimeout(() => {
      setSendVerificationEmailAgainStatus("idle");
      setShowForgotPasswordPopup(false);
    }, 1500);
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

  return (
    <>
      <div className="flex items-center justify-center pt-10 sm:pt-20">
        <div className="flex flex-col justify-center items-center gap-4 min-w-[96%] sm:min-w-[400px] bg-white rounded-xl p-5">
          <div className="rounded-full bg-gray-300 flex flex-row items-center justify-center w-full">
            <AuthSegmentControl
              activeTab={formType}
              setActiveTab={setFormType}
              tabs={AuthSegmentControlTabs}
            />
          </div>
          <form
            onSubmit={formType === "login" ? handleUserLogin : handleUserSignUp}
            className="flex flex-col gap-3 w-full"
          >
            <Input
              id="email"
              placeholder="Email*"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormDataChange}
              className="text-black"
              tabIndex={1}
              autoFocus
            />
            <Input
              id="password"
              placeholder="Password*"
              name="password"
              value={formData.password}
              onChange={handleFormDataChange}
              className="text-black"
              type={showPassword.password ? "text" : "password"}
              icon={showPassword.password ? FaEyeSlash : FaEye}
              onIconClick={() => {
                setShowPassword({
                  ...showPassword,
                  password: !showPassword.password,
                });
              }}
              tabIndex={2}
            />
            {formType === "signup" ? (
              <Input
                id="passwordConfirm"
                placeholder="Confirm Password*"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleFormDataChange}
                className="text-black"
                type={showPassword.passwordConfirm ? "text" : "password"}
                icon={showPassword.passwordConfirm ? FaEyeSlash : FaEye}
                onIconClick={() => {
                  setShowPassword({
                    ...showPassword,
                    passwordConfirm: !showPassword.passwordConfirm,
                  });
                }}
                tabIndex={3}
              />
            ) : (
              <p
                className="text-black self-end hover:text-[#0000EE] cursor-pointer"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </p>
            )}
            <p
              className="text-red-500 text-wrap"
              style={{ visibility: error ? "visible" : "hidden" }}
            >
              {error || "Something went wrong!"}
            </p>
            {formType === "signup" ? (
              <Button
                type="submit"
                className="w-full bg-[#4b5085] hover:bg-[#35385e]"
              >
                {authLoading ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  "Sign up"
                )}
              </Button>
            ) : (
              <div className="relative w-full">
                <Button
                  type="submit"
                  className="w-full bg-[#4b5085] hover:bg-[#35385e]"
                >
                  {authLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
                {lastUsedAuthMethod === "password" && (
                  <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform rounded-full bg-white px-2 py-1 text-xs font-medium text-[#4b5085] border border-[#4b5085]">
                    Last Used
                  </div>
                )}
              </div>
            )}
            <div className="relative w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleUserSignUpWithGoogle}
                className="text-black w-full"
              >
                <FcGoogle />{" "}
                {formType === "signup"
                  ? "Sign up with Google"
                  : "Login with Google"}
              </Button>
              {lastUsedAuthMethod === "google" && (
                <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform rounded-full bg-[#4b5085] px-2 py-1 text-xs font-medium text-white border border-white">
                  Last Used
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <Dialog
        open={showVerificationEmailPopup}
        onOpenChange={setShowVerificationEmailPopup}
      >
        <DialogContent className="[&>button>svg]:text-black">
          <DialogHeader>
            <DialogTitle className="text-black mb-3">
              Verification Email Successfully Sent!
            </DialogTitle>
            <DialogDescription className="text-black">
              Kindly check for verification email sent to your email address.
              <br />
              Make sure to check the spam folder as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="bg-[#4b5085] hover:bg-[#35385e]"
                onClick={() => handleContinueToLogin(true)}
              >
                Continue to Login
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showEmailNotVerifiedPopup}
        onOpenChange={setShowEmailNotVerifiedPopup}
      >
        <DialogContent className="[&>button>svg]:text-black">
          <DialogHeader>
            <DialogTitle className="text-black mb-3">
              Please Verify Your Email!
            </DialogTitle>
            <DialogDescription className="text-black">
              Kindly verify your account through the verification email sent to
              your email address.
              <br />
              Make sure to check the spam folder as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleSendVerificationAgain}
              className="text-black"
              style={{
                cursor:
                  sendVerificationEmailAgainStatus !== "idle"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {sendVerificationEmailAgainStatus === "idle" ? (
                "Send Verification Again"
              ) : sendVerificationEmailAgainStatus === "sending" ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <p>Sending..</p>
                </>
              ) : (
                <>
                  <FaCheck className="text-white bg-[#23b93d] rounded-full p-[2px]" />
                  <p>Sent!</p>
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button
                className="bg-[#4b5085] hover:bg-[#35385e]"
                onClick={() => handleContinueToLogin(false)}
              >
                Continue to Login
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showForgotPasswordPopup}
        onOpenChange={setShowForgotPasswordPopup}
      >
        <DialogContent className="[&>button>svg]:text-black">
          <DialogHeader>
            <DialogTitle className="text-black mb-3">
              Forgot Your Password?
            </DialogTitle>
            <DialogDescription className="text-black">
              Enter your email so that we can send you password reset link.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Email*"
              name="forgotPasswordEmail"
              value={forgotPasswordEmailInput}
              onChange={(e) => {
                setForgotPasswordEmailInput(e.target.value);
                setError("");
              }}
              className="text-black mb-1"
              type="email"
              onIconClick={() => {
                setShowPassword({
                  ...showPassword,
                  passwordConfirm: !showPassword.passwordConfirm,
                });
              }}
              tabIndex={1}
              autoFocus
            />
            <p
              className="text-red-500 text-wrap"
              style={{ visibility: error ? "visible" : "hidden" }}
            >
              {error || "Something went wrong!"}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={handleBackToLogin}
                className="text-black"
              >
                Back to Login
              </Button>
            </DialogClose>
            <Button
              className="bg-[#4b5085] hover:bg-[#35385e]"
              onClick={handleSendForgotPasswordEmail}
              disabled={error !== ""}
              style={{
                cursor:
                  sendVerificationEmailAgainStatus !== "idle"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {sendVerificationEmailAgainStatus === "idle" ? (
                "Send Email"
              ) : sendVerificationEmailAgainStatus === "sending" ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <p>Sending..</p>
                </>
              ) : (
                <>
                  <FaCheck className="text-[#23b93d] bg-white rounded-full p-[2px]" />
                  <p>Sent!</p>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthPage;
