import React from "react";
import type { IconType } from "react-icons";

interface StatsElementProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: string;
}

const StatsElement = ({
  title,
  value,
  icon: Icon,
  trend,
}: StatsElementProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          {trend && (
            <p className="mt-2 text-sm font-medium text-green-600">
              {trend}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsElement;
