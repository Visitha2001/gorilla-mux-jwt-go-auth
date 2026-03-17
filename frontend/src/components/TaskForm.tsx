import React, { useState, useEffect } from "react";
import http from "../services/httpService";
import type { Task } from "../Types";
import { X } from "lucide-react";

interface Props {
  initialData?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TaskForm({ initialData, onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "pending",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  });

  // Helper to format ISO string to YYYY-MM-DD for the input field
  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure we send full ISO strings to the Go backend
      const payload = {
        ...formData,
        start_date: new Date(formData.start_date!).toISOString(),
        end_date: new Date(formData.end_date!).toISOString(),
      };

      if (initialData?.id) {
        await http.put(`/tasks/${initialData.id}`, payload);
      } else {
        await http.post("/tasks", payload);
      }
      onSuccess();
    } catch (err) {
      alert("Action failed. Check console.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-lg relative max-h-[90vh] overflow-y-auto">
      <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <X size={20} />
      </button>

      <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Task" : "New Task"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full border rounded-lg p-2 mt-1 outline-none"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <div className="relative mt-1">
              <input
                type="date"
                className="w-full border rounded-lg p-2 pl-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={formatDateForInput(formData.start_date)}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <div className="relative mt-1">
              <input
                type="date"
                className="w-full border rounded-lg p-2 pl-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={formatDateForInput(formData.end_date)}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            {initialData ? "Update Task" : "Create Task"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}