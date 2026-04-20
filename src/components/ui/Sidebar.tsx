import React, { useState } from 'react';
import {
  Home,
  Users,
  Calendar,
  Settings,
  FileText,
  Activity,
  ShieldAlert,
  UserPlus,
  Stethoscope,
  Pill,
  Hexagon,
  User,
  ChevronRight,
  LogOut,
  Search,
  NotepadText,
  PillIcon,
  ShoppingBag,
  HeartPulse,
} from 'lucide-react';
import OkieDocLogo from 'src/assets/okie-doc-logo.png';
import { useNavigate } from 'react-router';

// 1. DEFINE YOUR TYPES
export type UserRole = 'patient' | 'specialist' | 'nurse' | 'admin';

interface NavItemType {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavGroupType {
  groupName: string;
  items: NavItemType[];
}

// 2. CREATE YOUR ROLE-BASED CONFIGURATIONS
const navigationConfigs: Record<UserRole, NavGroupType[]> = {
  patient: [
    {
      groupName: 'My Health',
      items: [
        { label: 'Dashboard', icon: Home, path: '/patient/dashboard' },
        { label: 'Services', icon: Stethoscope, path: '/patient/services' },
        {
          label: 'Appointments',
          icon: Calendar,
          path: '/patient/appointments',
        },
        {
          label: 'Medical Records',
          icon: NotepadText,
          path: '/patient/medicalRecords',
        },
        {
          label: 'Prescriptions',
          icon: PillIcon,
          path: '/patient/prescriptions',
        },
        {
          label: 'Pharmacy',
          icon: ShoppingBag,
          path: '/patient/pharmacy',
        },
        {
          label: 'Physical Therapy',
          icon: HeartPulse,
          path: '/patient/physicalTherapy',
        },
        {
          label: 'Profile',
          icon: User,
          path: '/patient/profile',
        },
      ],
    },
  ],
  specialist: [
    {
      groupName: 'Practice',
      items: [
        { label: 'Dashboard', icon: Home, path: '/specialist/dashboard' },
        { label: 'My Schedule', icon: Calendar, path: '/specialist/schedule' },
        { label: 'My Patients', icon: Users, path: '/specialist/patients' },
      ],
    },
    {
      groupName: 'Tools',
      items: [
        {
          label: 'Consultations',
          icon: Stethoscope,
          path: '/specialist/consultations',
        },
        { label: 'EMR Access', icon: FileText, path: '/specialist/emr' },
      ],
    },
  ],
  nurse: [
    {
      groupName: 'Triage & Care',
      items: [
        { label: 'Triage Queue', icon: Activity, path: '/nurse/triage' },
        { label: 'Patient Intake', icon: UserPlus, path: '/nurse/intake' },
      ],
    },
    {
      groupName: 'Schedule',
      items: [{ label: 'Duty Roster', icon: Calendar, path: '/nurse/roster' }],
    },
  ],
  admin: [
    {
      groupName: 'Overview',
      items: [
        { label: 'System Dashboard', icon: Activity, path: '/admin/dashboard' },
        { label: 'User Management', icon: Users, path: '/admin/users' },
      ],
    },
    {
      groupName: 'System',
      items: [
        { label: 'Security Logs', icon: ShieldAlert, path: '/admin/security' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
      ],
    },
  ],
};

// Flatten all nav items from all groups for a given role
function getFlatNavItems(role: UserRole): NavItemType[] {
  return navigationConfigs[role].flatMap((group) => group.items);
}

// 3. THE ACTUAL SIDEBAR COMPONENT
export function Sidebar({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');

  const currentNavGroups = navigationConfigs[role];

  // For the bottom tab bar, show a limited set of items (max 6 for usability)
  const allItems = getFlatNavItems(role);
  const bottomNavItems = allItems.slice(0, 6);

  const handleNavClick = (label: string, path: string) => {
    setActiveItem(label);
    navigate(path);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────
          DESKTOP SIDEBAR — visible on lg and above
      ───────────────────────────────────────────── */}
      <aside className='hidden lg:flex w-64 h-screen bg-white border-r border-gray-200 flex-col font-sans shrink-0'>
        {/* Logo */}
        <div className='flex items-center gap-3 px-6 py-8'>
          <img
            src={OkieDocLogo}
            alt='OkieDoc Logo'
            className='h-10 transition-all shadow-sm'
          />
        </div>

        {/* Dynamic Navigation Area */}
        <div className='flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-hide'>
          {currentNavGroups.map((group) => (
            <div key={group.groupName}>
              <h3 className='px-3 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider'>
                {group.groupName}
              </h3>
              <div className='space-y-1'>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.label;

                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.label, item.path)}
                      className={`w-full group flex items-center hover:cursor-pointer gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isActive
                          ? 'text-white bg-linear-to-r from-blue-600 to-blue-500'
                          : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <Icon
                        className={`size-4.5 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-500 group-hover:text-blue-500'
                        }`}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className='p-4 border-t border-gray-300/50 flex flex-col gap-2'>
          <button className='w-full flex items-center justify-between px-3 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer group'>
            <div className='flex items-center gap-3'>
              <div className='flex flex-col items-start gap-1'>
                <span className='text-sm font-medium text-gray-700 group-hover:text-blue-900 transition-colors'>
                  Need Help?
                </span>
                <span className='text-xs font-medium text-left text-gray-600 group-hover:text-blue-800 transition-colors'>
                  Our support team is available 24/7
                </span>
                <span className='text-[10px] text-gray-500 uppercase tracking-wider'>
                  {role}
                </span>
              </div>
            </div>
            <ChevronRight className='size-4 text-gray-500 group-hover:text-blue-600 transition-colors' />
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────
          MOBILE BOTTOM TAB BAR — visible below lg
      ───────────────────────────────────────────── */}
      <nav className='lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-stretch'>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.label, item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <Icon
                className={`size-5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-[10px] font-medium leading-tight truncate w-full text-center ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className='absolute top-1.5 w-1 h-1 rounded-full bg-blue-600' />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
