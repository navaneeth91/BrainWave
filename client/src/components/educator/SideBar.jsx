import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Users,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const SideBar = () => {
  const { isEducator } = useContext(AppContext);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/educator",
      icon: LayoutDashboard,
    },
    {
      name: "Add Course",
      path: "/educator/add-course",
      icon: PlusCircle,
    },
    {
      name: "My Courses",
      path: "/educator/my-course",
      icon: BookOpen,
    },
    {
      name: "Students Enrolled",
      path: "/educator/students-enrolled",
      icon: Users,
    },
  ];

  if (!isEducator) return null;

  return (
    <aside className="md:w-64 w-[72px] min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">

      {/* ================================= */}
      {/* LOGO / BRAND */}
      {/* ================================= */}

      <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">

            <GraduationCap
              size={23}
              className="text-white"
            />

          </div>

          <div className="hidden md:block">

            <h2 className="font-bold text-gray-900 text-lg leading-none">
              BrainWave
            </h2>

            <p className="text-[11px] text-gray-400 mt-1">
              Educator Portal
            </p>

          </div>

        </div>

      </div>

      {/* ================================= */}
      {/* MENU TITLE */}
      {/* ================================= */}

      <div className="hidden md:block px-6 pt-7 pb-3">

        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          Main Menu
        </p>

      </div>

      {/* ================================= */}
      {/* NAVIGATION */}
      {/* ================================= */}

      <nav className="flex-1 px-2 md:px-3">

        <div className="space-y-1.5">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/educator"}
                className={({ isActive }) =>
                  `
                  group relative flex items-center
                  md:justify-start justify-center
                  gap-3
                  h-12
                  md:px-4
                  rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-orange-50 text-orange-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }
                  `
                }
              >

                {({ isActive }) => (
                  <>

                    {/* Active indicator */}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-orange-500" />
                    )}

                    {/* ICON */}

                    <div
                      className={`
                        flex items-center justify-center
                        w-9 h-9 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-orange-100 text-orange-600"
                            : "text-gray-500 group-hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    {/* TEXT */}

                    <span className="hidden md:block flex-1 text-sm font-medium">
                      {item.name}
                    </span>

                    {/* ARROW */}

                    <ChevronRight
                      size={16}
                      className={`
                        hidden md:block
                        transition-all duration-200
                        ${
                          isActive
                            ? "opacity-100 translate-x-0 text-orange-500"
                            : "opacity-0 -translate-x-1"
                        }
                      `}
                    />

                    {/* MOBILE TOOLTIP */}

                    <span className="md:hidden absolute left-[62px] z-50 whitespace-nowrap px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.name}
                    </span>

                  </>
                )}

              </NavLink>
            );
          })}

        </div>

      </nav>

      {/* ================================= */}
      {/* BOTTOM INFO */}
      {/* ================================= */}

      <div className="p-3">

        <div className="hidden md:block rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">

              <GraduationCap
                size={18}
                className="text-orange-500"
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-gray-800">
                Educator Mode
              </p>

              <p className="text-[11px] text-gray-500 mt-0.5">
                Manage your courses
              </p>

            </div>

          </div>

        </div>

        {/* Collapsed version */}

        <div className="md:hidden flex justify-center">

          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">

            <GraduationCap
              size={19}
              className="text-orange-500"
            />

          </div>

        </div>

      </div>

    </aside>
  );
};

export default SideBar;