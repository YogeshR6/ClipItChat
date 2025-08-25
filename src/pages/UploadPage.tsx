"use client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { uploadUserPostImageToCloudinaryAndSaveInfoInFirestore } from "@/utils/cloudinaryFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const UploadPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  const handleFileUpload = (file: File[]) => {
    setUploadedFile(file[0]);
  };

  const handleUserNewPostUpload = async () => {
    if (uploadedFile && user) {
      const newPostId =
        await uploadUserPostImageToCloudinaryAndSaveInfoInFirestore(
          uploadedFile,
          user.uid
        );
      router.push(`/posts/${newPostId}`);
    }
  };

  if (isLoggedIn === false) {
    return <></>;
  }

  return (
    <div className="flex flex-col w-full justify-start items-center">
      <h2>Upload Page</h2>
      <div className="w-[95%] border-2">
        {uploadedFile ? (
          <div>
            <h3>Uploaded File:</h3>
            <p>{uploadedFile.size}</p>
            <Image
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded"
              width={200}
              height={200}
            />
            <Button type="button" onClick={() => setUploadedFile(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUserNewPostUpload}
              variant="outline"
              type="submit"
            >
              Save
            </Button>
          </div>
        ) : (
          <FileUpload onChange={handleFileUpload} />
        )}
      </div>
    </div>
  );
};

export default UploadPage;
