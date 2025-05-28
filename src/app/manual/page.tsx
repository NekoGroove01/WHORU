"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ManualIndex from "@/components/ui/ManualIndex";

export default function ManualPage() {
  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 상단 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          How to Use WHO<span className="logo-accent">R</span>U?
        </h1>
      </header>

      {/* grid layout */}
      <div className="grid grid-cols-[16rem_1fr] pt-[80px] min-h-screen">
        {/* ManualIndex (좌측 사이드바) */}
        <ManualIndex />

        {/* 본문 영역 */}
        <main className="px-12 py-10 overflow-y-auto">
          <section id="intro" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-[900] text-gray-800 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              WHORU is a web application that allows users to freely ask and
              answer questions without revealing their identity.
            </p>
            <h3 className="text-xl mt-4">Key Features</h3>
            <ul className="space-y-3 list-inside">
              <li>
                Complete Anonymity : Identity protection with temporary
                nicknames without registration
              </li>
              <li>
                Group-Centered Communication : Efficient communication
                environment through purpose-specific group creation{" "}
              </li>
              <li>
                AI Integration : Automated question answering and similar
                question recommendations
              </li>
            </ul>
          </section>

          <section id="basic" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Getting Started
            </h2>
            <h3>Main Screen</h3>
            <p>
              From the main screen, you can access basic functions such as
              creating groups, joining groups, and browsing public groups.
            </p>
            <br />
            <h3>Group Management</h3>
            <p className="mt-2 mb-1">A. Creating a Group</p>
            <ul className="space-y-3 ml-4 list-inside">
              <li>1. Click the 'Create a Group' button </li>
              <li>
                2. Enter group name (required) / Enter group description
                (optional)
              </li>
              <li>
                3. Check the checkbox if you want to create a public group
              </li>
              <li>4. Click the 'Create Group' button</li>
              <li>5. Result: Group created successfully! </li>
            </ul>
            <p className="mt-3 mb-1">B. Joining a Private Group</p>
            <ul className="space-y-3 ml-4 list-inside ">
              <li>1. Click the 'Join a Group' button </li>
              <li>2. Enter the group name or group link </li>
              <li>3. Scan QR code to join (optional) </li>
              <li>4. Result: Join Group successfully!</li>
            </ul>
            <p className="mt-3 mb-1">C. Joining Public Groups</p>
            <ul className="space-y-3 ml-4 list-inside">
              <li>
                1. If you have a specific group: Click "Join Group" button
                <br />
                If not: Click "Browse All Groups" button
              </li>
              <li>
                2. Enter desired tags in the search bar <br />
                Find your desired group and click "Join Group" button
              </li>
            </ul>
          </section>

          <section id="advanced" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Questions and Answers
            </h2>
            <h3 className="my-2">Writing Questions</h3>
            <ul className="space-y-3 list-inside">
              <li>
                1. Enter title and content in the question form on the left side
                of the group screen
              </li>
              <li>2. Select tags related to your question (optional)</li>
              <li>3. Click "Post Question" button</li>
            </ul>
            <h3 className="my-2">Writing Answers</h3>
            <ul className="space-y-3 list-inside">
              <li>1. Click on the title of the question you want to answer</li>
              <li>
                2. Enter your answer in the answer form at the bottom of the
                screen
              </li>
              <li>3. Click the “Post Answer" button</li>
            </ul>
            <h3 className="my-2">Liking Answers</h3>
            <ul className="space-y-3 list-inside">
              <li>
                If you like an answer, click the arrow to show appreciation
              </li>
            </ul>
          </section>

          <section id="faq" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Group Settings
            </h2>
            <h3 className="my-2">Accessing Settings</h3>
            <ul className="space-y-3 list-inside">
              <li>
                Click "Settings" in the top right corner of the group screen
              </li>
            </ul>
            <h3 className="my-2">General Settings</h3>
            <ul className="space-y-3 list-inside">
              <li className="font-semibold">Basic Information</li>
              <li>Change Group Name: Modify group name</li>
              <li>Change Group Description: Modify group description</li>
              <li className="font-semibold">Privacy Settings</li>
              <li>
                Convert to Public Group: Check the checkbox to make the group
                public
              </li>
              <li className="font-semibold">Danger Zone</li>
              <li>Archive Group</li>
              <li className="ml-4">
                Function: Temporarily deactivate the group
              </li>
              <li className="ml-4">
                Group is hidden from the list (all data is safely stored)
              </li>
              <li className="ml-4">
                Archived groups are not displayed in the general group list
              </li>
              <li className="ml-4">
                All data including posts, comments, and member information is
                preserved
              </li>
              <li className="ml-4">
                Group can be restored at any time when needed
              </li>
              <li>
                Recommended Us: When you want to temporarily deactivate a group.
                Safe data storage as it's not complete deletion
              </li>
              <li>Delete Group</li>
              <li className="ml-4">Function: Permanently delete the group</li>
              <li className="ml-4">
                Complete deletion of all group data (posts, comments, member
                information, etc.)
              </li>
              <li className="ml-4">Deleted groups cannot be recovered</li>
              <li>
                <p className="text-red-700 font-bold">
                  Warning: This action cannot be undone
                </p>
              </li>
            </ul>
            <h3 className="my-2">Invite & Share</h3>
            <ul className="space-y-3 list-inside">
              <li>
                Function: Provides invitation links and QR codes for private
                groups
              </li>
              <li>1. Copy and share the link</li>
              <li>2. Invite through QR code scanning</li>
            </ul>
            <h3 className="my-2">Tag Management</h3>
            <ul className="space-y-3 list-inside">
              <li>Click "Add/Edit Tags" button</li>
              <li>Click "x" on tags you want to delete</li>
              <li>Enter desired tag and click "Add"</li>
              <li>
                After completing all settings, click "Save Changes" in the top
                right corner to save changes
              </li>
            </ul>
          </section>

          <section id="support" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              FAQ / Technical Support
            </h2>
            <ul className="space-y-3 list-inside">
              <li>Frequently asked questions and answers from users</li>
            </ul>
            <h3 className="my-4">Technical Support</h3>
            <ul className="space-y-3 list-inside">
              <li>Contact Information : manimani@gmail.com</li>
              <li>Support Hours : 09:00 ~ 18:00</li>
              <li>Last Updated: </li>
            </ul>
          </section>
        </main>
      </div>
    </motion.div>
  );
}
