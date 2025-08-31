import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/svlogo.svg";
import { LogOutIcon, Menu } from "lucide-react";
import DropDown from "./DropDown";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="xs:top-0 opacity-80 backdrop-blur-sm xs:min-w-[100%]   xs:mt-0 xs:h-1 xs:rounded-none 2xs:min-w-[100vw]   xs:fixed xs:text-sm  xs:py-7 xs:flex xs:justify-between xs:items-center xs:px-4 nsl:top-10  nsl:rounded-full nsl:min-w-[80vw] nsl:!px-6 md:min-w-[70vw] sm:h-[6vh] lg:min-w-[75vw] 2lg:h-[8vh] 2xl:min-w-[70vw] mt-15 sticky top-15  mx-auto inset-0 flex w-[55%] items-center justify-around md:gap-10 border border-gray-800 rounded-full    md:text-xl bg-gray-900 py-10 z-1000">
      <NavLink
        to="/dashboard"
        className="flex items-center lg:gap-1 gap-2 hover:cursor-pointer "
      >
        <img
          src={logo}
          alt=""
          className="xs:w-8 xs:h-8  2lg:w-12 2lg:h-12 2xl:w-16 2xl:h-16"
        />
        <p className="xs:text-xl 2lg:text-[22px] 2xl:text-3xl text-2xl font-bold bg-gradient-to-r from-gray-500 via-blue-400 to-gray-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer ">
          Printery
        </p>
      </NavLink>
      <div className="relative lg:hidden" ref={wrapperRef}>
        <div>
          <Menu onClick={() => setOpen((prev) => !prev)} />
        </div>

        {/* Mobile */}
        {open && (
          <div className="absolute right-0 xs:mt-6  xs:w-38 xxs:w-40 sm:w-44 sm:pt-3 xs:-mr-2 xxs:-mr-3 xxs:pt-1 nsl:-mr-8 md:-mr-12   w-40 rounded-xl bg-gray-900 shadow-lg border border-gray-700 opacity-100 backdrop-blur-lg">
            <ul className="flex flex-col text-white text-sm items-center xs:py-2 xxs:text-[16px] md:text-[18px]">
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2 ">
                <NavLink
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-block  ${
                      isActive
                        ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                        : ""
                    }`
                  }
                >
                  <span className=" block rounded-full px-6 py-3 text-white bg-gray-900 ">
                    Dashboard
                  </span>
                </NavLink>
              </li>
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2">
                <NavLink
                  to="/order-files"
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-block  ${
                      isActive
                        ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                        : ""
                    }`
                  }
                >
                  <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
                    Order files
                  </span>
                </NavLink>
              </li>
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2">
                <NavLink
                  to="/your-orders"
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-block  ${
                      isActive
                        ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                        : ""
                    }`
                  }
                >
                  <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
                    Your orders
                  </span>
                </NavLink>
              </li>
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2">
                <NavLink
                  to="/payments"
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-block  ${
                      isActive
                        ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                        : ""
                    }`
                  }
                >
                  <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
                    Payments
                  </span>
                </NavLink>
              </li>
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2">
                <NavLink
                  to="/help"
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-block  ${
                      isActive
                        ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                        : ""
                    }`
                  }
                >
                  <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
                    Help
                  </span>
                </NavLink>
              </li>
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 px-2">
                <NavLink
                  to="/account"
                  onClick={() => setOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-block  ${
                      isActive
                        ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                        : ""
                    }`
                  }
                >
                  <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
                    Account
                  </span>
                </NavLink>
              </li>

              <hr className="w-full  text-gray-700" />
              <li className=" w-full flex items-center justify-center hover:!bg-gray-800 pt-1">
                <LogOutIcon className="w-5 h-5 " />
                <button
                  onClick={async () => {
                    setOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                  className=" !border-none  !text-red-500 !font-bold  !bg-transparent"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      {/* Desktop */}
      <div className="hidden lg:block">
        <NavLink
          to="/dashboard"
          className={({ isActive }: { isActive: boolean }) =>
            `relative inline-block  ${
              isActive
                ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                : ""
            }`
          }
        >
          <span className=" block rounded-full px-6 py-3 text-white bg-gray-900 lg:text-[15px] lg:px-[1.5vw] 2lg:text-lg nxl:px-[2vw] 2xl:text-2xl 2xl:px-[1vw]">
            Dashboard
          </span>
        </NavLink>
        <NavLink
          to="/order-files"
          className={({ isActive }: { isActive: boolean }) =>
            `relative inline-block  ${
              isActive
                ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                : ""
            }`
          }
        >
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900 lg:text-[15px] lg:px-[1.5vw]  2lg:text-lg nxl:px-[2vw] 2xl:text-2xl 2xl:px-[1vw]">
            Order files
          </span>
        </NavLink>
        <NavLink
          to="/your-orders"
          className={({ isActive }: { isActive: boolean }) =>
            `relative inline-block  ${
              isActive
                ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                : ""
            }`
          }
        >
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900 lg:text-[15px] lg:px-[1.5vw]  2lg:text-lg nxl:px-[2vw] 2xl:text-2xl 2xl:px-[1vw]">
            Your orders
          </span>
        </NavLink>
        <NavLink
          to="/payments"
          className={({ isActive }: { isActive: boolean }) =>
            `relative inline-block  ${
              isActive
                ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                : ""
            }`
          }
        >
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900 lg:text-[15px] lg:px-[1.5vw]  2lg:text-lg nxl:px-[2vw] 2xl:text-2xl 2xl:px-[1vw]">
            Payments
          </span>
        </NavLink>
        <NavLink
          to="/help"
          className={({ isActive }: { isActive: boolean }) =>
            `relative inline-block  ${
              isActive
                ? "rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                : ""
            }`
          }
        >
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900 lg:text-[15px] lg:px-[1.5vw]  2lg:text-lg nxl:px-[2vw] 2xl:text-2xl 2xl:px-[1vw]">
            Help
          </span>
        </NavLink>
      </div>

      <div className="xs:hidden lg:block">
        <DropDown />
      </div>
    </div>
  );
};

export default Navbar;
