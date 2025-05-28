import React from "react";

type ScrollLinkProps = {
  targetId: string;
  children: React.ReactNode;
};

function ScrollLink({ targetId, children }: ScrollLinkProps) {
  const handleClick = () => {
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hover:underline text-left block w-full text-sm text-gray-800 dark:text-gray-200"
    >
      {children}
    </button>
  );
}

function ManualIndex() {
  return (
    <aside className="sticky top-[80px] h-[calc(100vh-60px)] w-64 p-4 mt-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 font-pretendard">
      <nav className="space-y-2 px-3">
        <p className="text-lg font-bold mb-4 mt-4">Index</p>
        <ul className="space-y-5 list-inside">
          <li>
            <ScrollLink targetId="intro">1. Introduction</ScrollLink>
          </li>
          <li>
            <ScrollLink targetId="basic">2. Getting Started</ScrollLink>
          </li>
          <li>
            <ScrollLink targetId="advanced">
              3. Questions and Answers
            </ScrollLink>
          </li>
          <li>
            <ScrollLink targetId="faq">4. Group Settings</ScrollLink>
          </li>
          <li>
            <ScrollLink targetId="support">
              5. FAQ / Technical Support
            </ScrollLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default ManualIndex;
