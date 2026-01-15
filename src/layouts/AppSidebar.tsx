import React from "react";
import { NavLink } from "react-router-dom";
import useAuthUser from "@/hooks/useAuthUser";
import { UserRole } from "@/types/auth";

const IconEdit = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconSearch = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconCheck = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconUsers = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCode = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconBuilding = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

interface MenuSection {
  title: string;
  items: MenuItem[];
  roles?: UserRole[];
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const getMenuSections = (role: UserRole | null): MenuSection[] => {
  if (!role) return [];

  const allMenuSections: MenuSection[] = [
    {
      title: "상담 관리",
      items: [
        { label: "상담 등록", path: "/consultations/new", icon: <IconEdit /> },
        {
          label: "상담 검색",
          path: "/consultations/search",
          icon: <IconSearch />,
        },
      ],
      roles: ["CONSULTANT", "REVIEWER", "ADMIN"],
    },
    {
      title: "메뉴얼 관리",
      items: [
        { label: "메뉴얼 검색", path: "/manuals/search", icon: <IconSearch /> },
        {
          label: "메뉴얼 초안 목록",
          path: "/manuals/drafts",
          icon: <IconEdit />,
        },
      ],
      roles: ["CONSULTANT", "REVIEWER", "ADMIN"],
    },
    {
      title: "검토/리뷰",
      items: [
        {
          label: "검토 작업 목록",
          path: "/reviews/tasks",
          icon: <IconCheck />,
        },
      ],
      roles: ["REVIEWER", "ADMIN"],
    },
    {
      title: "관리자",
      items: [
        { label: "사용자 관리", path: "/admin/users", icon: <IconUsers /> },
        {
          label: "부서 관리",
          path: "/admin/departments",
          icon: <IconBuilding />,
        },
        {
          label: "공통코드 관리",
          path: "/admin/common-codes",
          icon: <IconCode />,
        },
      ],
      roles: ["ADMIN"],
    },
  ];

  return allMenuSections.filter((section) => section.roles?.includes(role));
};

const AppSidebar: React.FC = () => {
  const { user } = useAuthUser();
  const menuSections = getMenuSections(user?.role ?? null);

  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <nav className="p-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-4 mb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-4 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-700 border-l-primary-600 shadow-inner"
                          : "text-gray-700 border-l-transparent hover:bg-primary-50 hover:text-primary-700"
                      }`
                    }
                  >
                    <span className="text-gray-500">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
