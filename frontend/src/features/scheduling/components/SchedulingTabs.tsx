"use client";

import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ClipboardClock,
} from "lucide-react";
import { useState } from "react";
import SchedulingTable from "./list/SchedulingTable";
import PendingSchedulingTable from "./pending/PendingSchedulingTable";
import MyAvailabilityView from "./settings/MyAvailabilityView";
import SchedulingForm from "./settings/SchedulingForm";

type SchedulingTab =
  | "schedulings"
  | "pending"
  | "my-availability"
  | "availability";

export default function SchedulingTabs() {
  const [activeTab, setActiveTab] = useState<SchedulingTab>("schedulings");

  const tabClass = (tab: SchedulingTab) => `
    flex w-50 cursor-pointer items-center justify-center gap-3 whitespace-nowrap border-b-3 py-3 text-sm font-medium
    ${
      activeTab === tab
        ? "border-emerald-500 text-emerald-600"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    }
  `;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-gray-200">
        <nav
          className="flex overflow-x-auto"
          aria-label="Gestão de agendamentos"
        >
          <button
            type="button"
            onClick={() => setActiveTab("schedulings")}
            className={tabClass("schedulings")}
          >
            <CalendarDays className="h-4.5 w-4.5" />
            Agendamentos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={tabClass("pending")}
          >
            <ClipboardClock className="h-4.5 w-4.5" />
            Solicitações pendentes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my-availability")}
            className={tabClass("my-availability")}
          >
            <CalendarCheck className="h-4.5 w-4.5" />
            Minha agenda
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("availability")}
            className={tabClass("availability")}
          >
            <CalendarPlus className="h-4.5 w-4.5" />
            Criar agenda
          </button>
        </nav>
      </div>

      <div className="min-h-0 w-full flex-1">
        {activeTab === "pending" ? (
          <PendingSchedulingTable />
        ) : activeTab === "schedulings" ? (
          <SchedulingTable />
        ) : activeTab === "my-availability" ? (
          <MyAvailabilityView onGoToCreate={() => setActiveTab("availability")} />
        ) : (
          <SchedulingForm />
        )}
      </div>
    </div>
  );
}
