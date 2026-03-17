import React, { useEffect, useState } from "react";
import http from "../services/httpService";
import type { Task } from "../Types";
import { Trash2, Edit3, Plus, Loader2, Calendar, Clock, X } from "lucide-react";
import TaskForm from "../components/TaskForm";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // NEW: State for viewing details
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await http.get("/tasks");
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail modal
    setViewingTask(null);
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail modal
    if (!window.confirm("Delete this task?")) return;
    await http.delete(`/tasks/${id}`);
    setViewingTask(null);
    fetchTasks();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> New Task
        </button>
      </div>

      {/* --- TASK FORM MODAL (Add/Edit) --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <TaskForm 
              initialData={editingTask} 
              onSuccess={handleFormSuccess} 
              onCancel={() => { setShowForm(false); setEditingTask(null); }} 
            />
          </div>
        </div>
      )}

      {/* --- TASK DETAIL MODAL --- */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setViewingTask(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingTask(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
              viewingTask.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {viewingTask.status}
            </span>

            <h2 className="text-2xl font-bold mt-4 text-gray-800">{viewingTask.title}</h2>
            <p className="text-gray-600 mt-2 leading-relaxed">{viewingTask.description || "No description provided."}</p>

            <div className="mt-6 space-y-3 border-t pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span>Starts: {new Date(viewingTask.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-red-400" />
                <span>Ends: {new Date(viewingTask.end_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={(e) => handleEditClick(viewingTask, e)}
                className="flex-1 flex justify-center items-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                <Edit3 size={18}/> Edit Task
              </button>
              <button 
                onClick={(e) => handleDelete(viewingTask.id!, e)}
                className="flex-1 flex justify-center items-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
              >
                <Trash2 size={18}/> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TASK LIST --- */}
      {loading ? (
        <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => setViewingTask(task)}
              className="bg-white p-5 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">{task.title}</h3>
                  <span className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-1">{task.description}</p>
              </div>
              
              <div className="flex gap-1">
                <button onClick={(e) => handleEditClick(task, e)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  <Edit3 size={18} />
                </button>
                <button onClick={(e) => handleDelete(task.id!, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-center text-gray-400 mt-10">No tasks yet. Click "New Task" to begin!</p>}
        </div>
      )}
    </div>
  );
}