"use client";

import { DashboardSidebar } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { sanitizeFormData } from "@/lib/form-sanitize";
import apiClient from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

interface UserInput {
  email: string;
  password: string;
  role: "admin" | "user";
}

interface CreateUserResponse {
  id?: string;
  email?: string;
  role?: string;
  message?: string;
  error?: string;
}

const initialUserInput: UserInput = {
  email: "",
  password: "",
  role: "user",
};

const DashboardCreateNewUser = () => {
  const [userInput, setUserInput] =
    useState<UserInput>(initialUserInput);

  const [loading, setLoading] = useState(false);

  const addNewUser = async () => {
    const email = userInput.email.trim();
    const password = userInput.password;

    if (!email || !password || !userInput.role) {
      toast.error("You must enter all input values to add a user");
      return;
    }

    if (!isValidEmailAddressFormat(email)) {
      toast.error("You entered invalid email address format");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const sanitizedUserInput = sanitizeFormData({
        ...userInput,
        email,
      });

      const response = await apiClient.post(
        "/api/users",
        sanitizedUserInput
      );

      let data: CreateUserResponse = {};

      try {
        data = await response.json();
      } catch {
        // Some API responses may not contain JSON.
      }

      if (response.status !== 201) {
        throw new Error(
          data.error ||
            data.message ||
            "Error while creating user"
        );
      }

      toast.success("User added successfully");

      setUserInput({
        ...initialUserInput,
      });
    } catch (error: unknown) {
      console.error("Error while creating user:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Error while creating user";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex flex-col gap-y-7 xl:pl-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">
          Add new user
        </h1>

        {/* Email */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Email:
              </span>
            </div>

            <input
              type="email"
              autoComplete="email"
              className="input input-bordered w-full max-w-xs"
              value={userInput.email}
              disabled={loading}
              onChange={(event) =>
                setUserInput((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
            />
          </label>
        </div>

        {/* Password */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Password:
              </span>
            </div>

            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="input input-bordered w-full max-w-xs"
              value={userInput.password}
              disabled={loading}
              onChange={(event) =>
                setUserInput((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
            />
          </label>

          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters.
          </p>
        </div>

        {/* Role */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                User role:
              </span>
            </div>

            <select
              className="select select-bordered"
              value={userInput.role}
              disabled={loading}
              onChange={(event) =>
                setUserInput((previous) => ({
                  ...previous,
                  role: event.target.value as
                    | "admin"
                    | "user",
                }))
              }
            >
              <option value="admin">
                admin
              </option>

              <option value="user">
                user
              </option>
            </select>
          </label>
        </div>

        {/* Create user */}
        <div className="flex gap-x-2">
          <button
            type="button"
            disabled={loading}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void addNewUser()}
          >
            {loading ? "Creating user..." : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewUser;
