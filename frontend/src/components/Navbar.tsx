import { NavLink } from "react-router-dom";
import logo from "../assets/svlogo.svg";
import DropDown from "./DropDown";
const Navbar = () => {
  return (
    // <div className="flex justify-center pt-15 sticky top-0  items-center mx-auto gap-12 opacity-80 z-200">
    <div className="mt-15 sticky top-15  mx-auto inset-0 flex w-[55%] items-center justify-around gap-10 border border-gray-800 rounded-full p-2  h-16 text-xl bg-gray-900    py-10 z-1000">
      <NavLink
        to="/dashboard"
        className="flex items-center gap-2 hover:cursor-pointer "
      >
        <img src={logo} alt="" className="w-12 h-12 " />
        <p className="text-2xl font-bold bg-gradient-to-r from-gray-500 via-blue-400 to-gray-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer ">
          Printery
        </p>
      </NavLink>
      <div>
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
          <span className=" block rounded-full px-6 py-3 text-white bg-gray-900 ">
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
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
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
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
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
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
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
          <span className="block rounded-full px-6 py-3 text-white bg-gray-900">
            Help
          </span>
        </NavLink>
      </div>
      <DropDown />
    </div>
    // </div>
  );
};

export default Navbar;
