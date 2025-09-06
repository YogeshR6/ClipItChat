"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { AuthFormType, Tab } from "@/types/misc";
import { useRouter } from "next/navigation";

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  activeTab,
  setActiveTab,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  activeTab: Tab | null;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab | null>>;
}) => {
  const router = useRouter();

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setActiveTab(newTabs[0]);
    router.push(`/${newTabs[0].value === "home" ? "" : newTabs[0].value}`);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            className={cn("relative px-4 py-2 rounded-full", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {activeTab?.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-[#3361f4] rounded-full",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block text-white dark:text-white">
              {tab.title}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

export const AuthSegmentControl = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  activeTab,
  setActiveTab,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  activeTab: AuthFormType | null;
  setActiveTab: React.Dispatch<React.SetStateAction<AuthFormType>>;
}) => {
  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setActiveTab(newTabs[0].value as AuthFormType);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            className={cn(
              "relative px-4 py-2 rounded-full flex-1",
              tabClassName
            )}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {activeTab === tab.value && (
              <motion.div
                layoutId="clickedauthbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-[#3361f4] rounded-full",
                  activeTabClassName
                )}
              />
            )}

            <span
              className="relative block font-medium"
              style={{
                color: activeTab === tab.value ? "white" : "black",
              }}
            >
              {tab.title}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};
