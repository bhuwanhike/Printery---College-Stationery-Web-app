import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, LogOutIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";

export default function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Gear button */}
      <div className="xs:flex xs:items-center xs:justify-center xs:w-8 xs:h-8 2xl:w-14 2xl:h-14 relative inline-block">
        {/* Hidden gradient defs (must be in the DOM once) */}
        <svg aria-hidden className="absolute w-0 h-0">
          <defs>
            <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" /> {/* pink-500 */}
              <stop offset="50%" stopColor="#a855f7" /> {/* purple-500 */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
            </linearGradient>
          </defs>
        </svg>

        {/* Button with gradient border */}
        <button
          className="!inline-block !rounded-full !p-[1px] !bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
          onClick={() => setOpen(!open)}
        >
          <span className="!flex !items-center !justify-center xs:w-8 xs:h-8 2xl:w-14 2xl:h-14 !rounded-full !bg-gray-900 2lg:w-10 2lg:h-10">
            {/* 👇 Override the stroke to use the gradient */}
            <SettingsIcon
              className="xs:w-5 xs:h-5 2lg:w-6 2lg:h-6 2xl:w-10 2xl:h-10 "
              style={{ stroke: "url(#gearGradient)" }}
              strokeWidth={2}
            />
          </span>
        </button>
      </div>

      {/* Dropdown menu with animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 lg:mt-4 lg:-mr-2 w-40 rounded-xl bg-gray-900 shadow-lg border border-gray-700 "
          >
            <ul className="flex flex-col text-white text-sm items-center ">
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2 pt-2 pb-1">
                <NavLink
                  to="/account"
                  className=" px-4 py-1 hover:bg-gray-800 rounded-t-xl !text-white 2xl:text-xl"
                  onClick={() => setOpen(false)}
                >
                  Account
                </NavLink>
              </li>
              <hr className="w-full  text-gray-700" />
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 pt-1 ">
                <LogOutIcon className="" />
                <button
                  onClick={async () => {
                    setOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                  className=" !border-none  !text-red-500 !font-bold  !bg-transparent 2xl:!text-xl !px-2"
                >
                  Log out
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
