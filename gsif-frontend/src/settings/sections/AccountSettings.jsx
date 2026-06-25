import React from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Mail, IdCard, ChevronRight, UserPen } from "lucide-react";
import avatar from "../../assets/images/avatar.jpg";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard, Row } from "../components/SettingsCard";
import { getCurrentUser } from "../services/settingsService";

export default function AccountSettings() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const isInstitute = user.user_type === "institute" || user.organization_type;
  const name =
    (isInstitute && (user.institute_name || user.name)) || user.name || "Your account";

  // View profile (existing routes)
  const profilePath = isInstitute
    ? "/dashboard/institute-profile"
    : "/dashboard/individual-profile";

  // Edit profile (new routes)
  const editPath = isInstitute
    ? "/dashboard/institute-edit-profile"
    : "/dashboard/individual-edit-profile";

  return (
    <div>
      <SectionHeader
        title="Account"
        description="Your identity on the network and how people reach you."
      />

      <SettingsCard className="overflow-hidden">
        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
          {/* Identity → opens profile view */}
          <button
            type="button"
            onClick={() => navigate(profilePath)}
            aria-label="View profile"
            className="group flex min-w-0 flex-1 items-center gap-4 rounded-2xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60"
          >
            <div className="relative shrink-0">
              <img
                src={user.profile_image || avatar}
                onError={(e) => {
                  e.currentTarget.src = avatar;
                }}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 transition-all group-hover:ring-emerald-200 dark:ring-white/10 dark:group-hover:ring-[#00ff88]/30"
              />
              <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white dark:bg-[#0b100d]">
                <BadgeCheck
                  size={18}
                  className="text-emerald-500 dark:text-[#00ff88]"
                  aria-label="Verified account"
                />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <span className="block truncate text-lg font-semibold capitalize text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-[#00ff88]">
                {name}
              </span>
              <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium capitalize text-emerald-700 dark:bg-[#00ff88]/10 dark:text-[#00ff88]">
                {isInstitute ? "Research Institute" : "Individual Researcher"}
              </span>
            </div>

            <ChevronRight
              size={18}
              className="hidden shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400 sm:block"
            />
          </button>

          {/* Edit → opens edit page */}
          <button
            type="button"
            onClick={() => navigate(editPath)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:bg-[#00ff88] dark:text-[#04130c] dark:hover:bg-[#2be58a]"
          >
            <UserPen size={16} />
            Edit profile
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5">
          <Row icon={Mail} title="Email" description={user.email || "Not set"} />
          <Row
            icon={IdCard}
            title="Registration ID"
            description={user.registration_id || user.id || "Not available"}
            divider
          />
        </div>
      </SettingsCard>

      <SettingsCard className="mt-4">
        <button
          type="button"
          onClick={() => navigate(profilePath)}
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00ff88]/60 sm:px-5 dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <UserPen size={16} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Profile details
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your bio, skills, education and links
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </SettingsCard>
    </div>
  );
}