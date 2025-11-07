import { useState, useEffect, useRef } from "react";
import { throttle, getScrollbarWidth } from "utils/scrollUtils";

export const useModalAndUI = () => {
  const [followerVisible, setFollowerVisible] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("followers");
  const [activeTab, setActiveTab] = useState("post");
  const headerRef = useRef<HTMLDivElement | null>(null);

  // Handle modal scroll locking
  useEffect(() => {
    if (followerVisible) {
      const originalBodyPaddingRight = window.getComputedStyle(
        document.body
      ).paddingRight;
      const originalBodyOverflow = window.getComputedStyle(
        document.body
      ).overflow;
      const scrollbarWidth = getScrollbarWidth();
      const bodyPaddingRightValue = parseInt(originalBodyPaddingRight, 10) || 0;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${
        bodyPaddingRightValue + scrollbarWidth
      }px`;

      const header = document.querySelector<HTMLElement>(".header-section");
      let originalHeaderPaddingRight = "0px";

      if (header) {
        originalHeaderPaddingRight =
          window.getComputedStyle(header).paddingRight;
        const currentHeaderPadding =
          parseInt(originalHeaderPaddingRight, 10) || 0;
        header.style.paddingRight = `${
          currentHeaderPadding + scrollbarWidth
        }px`;
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
        if (header) {
          header.style.paddingRight = originalHeaderPaddingRight;
        }
      };
    }
  }, [followerVisible]);

  // Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (headerRef.current) {
        const scrollPosition =
          window.scrollY || document.documentElement.scrollTop;
        if (scrollPosition > 10) {
          headerRef.current.classList.add("sticky");
        } else {
          headerRef.current.classList.remove("sticky");
        }
      }
    }, 100);

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const showFollowersModal = () => {
    setActiveModalTab("followers");
    setFollowerVisible(true);
  };

  const showFollowingModal = () => {
    setActiveModalTab("following");
    setFollowerVisible(true);
  };

  const handleModalClose = () => {
    setFollowerVisible(false);
  };

  return {
    followerVisible,
    activeModalTab,
    setActiveModalTab,
    activeTab,
    setActiveTab,
    headerRef,
    showFollowersModal,
    showFollowingModal,
    handleModalClose,
  };
};
