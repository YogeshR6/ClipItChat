"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { GameCategoryType } from "@/types/misc";
import { uploadUserPostImageToCloudinaryAndSaveInfoInFirestore } from "@/utils/cloudinaryFunctions";
import { getGameCategoriesList } from "@/utils/gameCategoryFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
import { toast } from "sonner";
import { IoClose } from "react-icons/io5";

const UploadPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const gameSearchRef = useRef<HTMLInputElement>(null);
  const hasRedirected = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [gameCategoryList, setGameCategoryList] = useState<GameCategoryType[]>(
    []
  );
  const [gameSearchInput, setGameSearchInput] = useState<string>("");
  const [gameSearchLoading, setGameSearchLoading] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<GameCategoryType | null>(
    null
  );
  const [crop, setCrop] = useState<Crop>();
  const [showImageCropPopup, setShowImageCropPopup] = useState<boolean>(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [uploadPostLoading, setUploadPostLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn === false && !hasRedirected.current) {
      hasRedirected.current = true;

      toast.error("You need to be logged in to post.", {
        duration: 4000,
        closeButton: true,
      });
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      gameSearchRef.current?.focus();
      fetchGameCategories();
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [gameSearchInput]);

  const imgSrc = useMemo(() => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    }
  }, [uploadedFile]);

  const croppedImgSrc = useMemo(() => {
    if (croppedFile) {
      return URL.createObjectURL(croppedFile);
    } else {
      return "";
    }
  }, [croppedFile]);

  useEffect(() => {
    // This is the cleanup function that will run when the component unmounts
    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [imgSrc]);

  useEffect(() => {
    // This is the cleanup function that will run when the component unmounts
    return () => {
      if (croppedImgSrc) {
        URL.revokeObjectURL(croppedImgSrc);
      }
    };
  }, [croppedImgSrc]);

  const fetchGameCategories = async () => {
    if (gameSearchInput.length > 2) {
      setGameSearchLoading(true);
      const categories = await getGameCategoriesList(gameSearchInput);
      if (!(categories instanceof Error)) {
        setGameCategoryList(categories);
        setGameSearchLoading(false);
        gameSearchRef.current?.focus();
      }
    } else {
      setGameCategoryList(selectedGame ? [selectedGame] : []);
      setGameSearchLoading(false);
      gameSearchRef.current?.focus();
    }
  };

  const handleFileUpload = (file: File[]) => {
    setUploadedFile(file[0]);
    setShowImageCropPopup(true);
  };

  const handleUserNewPostUpload = async () => {
    if (!croppedFile || !selectedGame || uploadPostLoading) {
      toast.error(
        "Please ensure you have uploaded an image and have selected a category.",
        {
          duration: 4000,
          closeButton: true,
        }
      );
      return;
    }
    if ((user.imageStorageUsed || 0) + croppedFile.size / 1048576 > 100) {
      toast.error("You have reached your image storage limit.", {
        duration: 4000,
        closeButton: true,
      });
      return;
    }
    if (!user.username || user.username === "") {
      toast.error("Please complete your profile to upload.", {
        duration: 4000,
        closeButton: true,
        action: {
          label: "Go to My Profile",
          onClick: () => {
            router.push("/my-profile");
          },
        },
      });
      return;
    }
    if (user) {
      setUploadPostLoading(true);
      const newPostId =
        await uploadUserPostImageToCloudinaryAndSaveInfoInFirestore(
          croppedFile,
          {
            id: user.uid,
            username: user.username,
          },
          selectedGame
        );
      if (!(newPostId instanceof Error)) {
        setUploadPostLoading(false);
        router.push(`/posts/${newPostId}`);
      } else {
        toast.error("Something went wrong. Please try again later!", {
          duration: 4000,
          closeButton: true,
        });
      }
    }
  };

  const onCroppingImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const imageElement = e.currentTarget;
    const { width, height } = imageElement;

    const cropPercent = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        16 / 9,
        width,
        height
      ),
      width,
      height
    );

    const cropPixels: Crop = {
      unit: "px",
      x: (cropPercent.x / 100) * width,
      y: (cropPercent.y / 100) * height,
      width: (cropPercent.width / 100) * width,
      height: (cropPercent.height / 100) * height,
    };

    setCrop(cropPixels);
  };

  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !crop || !uploadedFile) {
      console.error("Missing required data for cropping.");
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    let sx = crop.x * scaleX;
    let sy = crop.y * scaleY;
    let sWidth = crop.width * scaleX;
    let sHeight = crop.height * scaleY;

    if (sx + sWidth > image.naturalWidth) {
      sWidth = image.naturalWidth - sx;
    }
    if (sy + sHeight > image.naturalHeight) {
      sHeight = image.naturalHeight - sy;
    }

    const finalX = Math.floor(sx);
    const finalY = Math.floor(sy);
    const finalWidth = Math.floor(sWidth);
    const finalHeight = Math.floor(sHeight);

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      finalX,
      finalY,
      finalWidth,
      finalHeight,
      0,
      0,
      finalWidth,
      finalHeight
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }

        const fileNameParts = uploadedFile.name.split(".");
        const fileExtension = fileNameParts.pop();
        const baseName = fileNameParts.join(".");
        const newFileName = `${baseName}-cropped.${fileExtension}`;

        const croppedFile = new File([blob], newFileName, {
          type: blob.type,
        });

        setCroppedFile(croppedFile);
        setShowImageCropPopup(false);
      },
      "image/png",
      1
    );
  };

  const handleRemoveImageClick = () => {
    if (!uploadPostLoading) {
      setUploadedFile(null);
      setCroppedFile(null);
    }
  };

  if (isLoggedIn === false) {
    return <></>;
  }

  if (user.imageStorageUsed && user.imageStorageUsed >= 100) {
    return <p>You have reached your image storage limit.</p>;
  }

  return (
    <div className="flex flex-col w-full justify-start items-center px-5 mb-10">
      <div className="border-2 p-3 flex flex-col w-[35%] justify-start items-center gap-5 rounded-xl bg-white">
        {!uploadedFile ? (
          <div className="w-full border-2 border-black rounded-2xl">
            <FileUpload onChange={handleFileUpload} />
          </div>
        ) : (
          croppedFile && (
            <div className="relative p-2">
              <Image
                src={croppedImgSrc}
                alt="Uploaded"
                width={500}
                height={500}
              />
              <IoClose
                className="absolute bg-gray-500 text-white p-1 rounded-full top-0 right-0"
                size="26"
                style={{
                  cursor: uploadPostLoading ? "not-allowed" : "pointer",
                }}
                onClick={handleRemoveImageClick}
              />
            </div>
          )
        )}
        <div className="flex flex-row gap-5 justify-center items-center text-black">
          <p className="font-bold">Select Category:</p>
          <Select
            value={selectedGame?.guid || ""}
            onValueChange={(value) => {
              const game = gameCategoryList.find((g) => g.guid === value);
              setSelectedGame(game || null);
            }}
            onOpenChange={(open) => {
              if (open) {
                setGameSearchInput("");
                setGameCategoryList(selectedGame ? [selectedGame] : []);
              }
            }}
          >
            <SelectTrigger className="w-[180px]" disabled={uploadPostLoading}>
              <SelectValue placeholder="Select a game">
                {selectedGame?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  <Input
                    placeholder="Search categories..."
                    value={gameSearchInput}
                    onChange={(e) => setGameSearchInput(e.target.value)}
                    autoFocus
                    ref={gameSearchRef}
                  />
                </SelectLabel>
                <SelectLabel>Results</SelectLabel>
                {gameSearchLoading ? (
                  <div className="flex flex-row w-full items-center justify-start gap-2 pl-2">
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    <p>Loading...</p>
                  </div>
                ) : (
                  gameCategoryList.map((category) => (
                    <SelectItem value={category.guid} key={category.guid}>
                      <div className="flex flex-row gap-3 items-center justify-center">
                        <Image
                          src={category.image["medium_url"]}
                          alt={category.name}
                          width={40}
                          height={40}
                        />
                        <h3>{category.name}</h3>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row gap-5">
          <Button
            type="button"
            onClick={() => {
              setUploadedFile(null);
              setCroppedFile(null);
            }}
            variant="outline"
            className="text-black"
            disabled={uploadPostLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUserNewPostUpload}
            variant="outline"
            type="submit"
            className="bg-[#4b5085] hover:bg-[#35385e] hover:text-white"
            style={{
              cursor: uploadPostLoading ? "not-allowed" : "pointer",
            }}
          >
            {uploadPostLoading ? (
              <div className="flex flex-row w-full items-center justify-start gap-2">
                <AiOutlineLoading3Quarters className="animate-spin" />
                <p>Saving...</p>
              </div>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
      <Dialog open={showImageCropPopup} onOpenChange={setShowImageCropPopup}>
        <DialogContent
          className="[&>button>svg]:text-black"
          onPointerDownOutside={(event) => {
            setShowImageCropPopup(false);
            setCroppedFile(null);
            setUploadedFile(null);
          }}
          onEscapeKeyDown={(event) => {
            setShowImageCropPopup(false);
            setCroppedFile(null);
            setUploadedFile(null);
          }}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-black mb-2">
              Crop Your Image
            </DialogTitle>
          </DialogHeader>
          {uploadedFile && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={16 / 9}
              minWidth={200}
              ruleOfThirds
            >
              <img
                src={imgSrc}
                onLoad={onCroppingImageLoad}
                ref={imgRef}
                alt="Crop preview"
                style={{ objectFit: "contain" }}
              />
            </ReactCrop>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="text-black"
                onClick={() => {
                  setShowImageCropPopup(false);
                  setCroppedFile(null);
                  setUploadedFile(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="text-white bg-[#4b5085] hover:bg-[#35385e]"
              onClick={handleCropImage}
            >
              Crop Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadPage;
