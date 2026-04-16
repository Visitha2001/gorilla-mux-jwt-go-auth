import React, { useEffect, useState } from "react";
import http from "../services/httpService";
import type { Task, SubTask } from "../Types";
import { Trash2, Edit3, Plus, Loader2, Calendar, Clock, X, CheckCircle, Circle } from "lucide-react";
import TaskForm from "../components/TaskForm";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // NEW: State for viewing details
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await http.get("/tasks");
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    if (viewingTask) {
      fetchSubTasks(viewingTask.id!);
    } else {
      setSubTasks([]);
      setNewSubTaskTitle("");
    }
  }, [viewingTask]);

  const fetchSubTasks = async (taskId: string) => {
    try {
      const { data } = await http.get(`/tasks/${taskId}/subtasks`);
      setSubTasks(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim() || !viewingTask) return;
    try {
      const payload: Partial<SubTask> = {
        title: newSubTaskTitle,
        description: "",
        status: "pending",
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
      };
      await http.post(`/tasks/${viewingTask.id}/subtasks`, payload);
      setNewSubTaskTitle("");
      fetchSubTasks(viewingTask.id!);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    if (!viewingTask) return;
    try {
      await http.delete(`/tasks/${viewingTask.id}/subtasks/${subTaskId}`);
      fetchSubTasks(viewingTask.id!);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubTaskStatus = async (subTask: SubTask) => {
    if (!viewingTask) return;
    try {
      const newStatus = subTask.status === 'completed' ? 'pending' : 'completed';
      await http.put(`/tasks/${viewingTask.id}/subtasks/${subTask.id}`, {
        ...subTask,
        status: newStatus
      });
      fetchSubTasks(viewingTask.id!);
    } catch (err) {
      console.error(err);
    }
  };

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

            {/* --- SUBTASKS SECTION --- */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Subtasks</h3>
              
              <form onSubmit={handleAddSubTask} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={!newSubTaskTitle.trim()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {subTasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-100 transition group">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggleSubTaskStatus(sub)}>
                      {sub.status === 'completed' ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-gray-300 group-hover:text-blue-400" />
                      )}
                      <span className={`text-sm ${sub.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {sub.title}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteSubTask(sub.id!)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {subTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No subtasks yet.</p>
                )}
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