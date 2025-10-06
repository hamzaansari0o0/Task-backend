const Task = require("../Models/taskModel");

// 1. Naya Task Banane ka Logic
const createTask = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const newTask = new Task({
      title,
      description,
      deadline,
      user: req.user.id, // Token se user ki ID lena
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// 2. User ke Saare Tasks Lane ka Logic
const getTasks = async (req, res) => {
  try {
    // Sirf woh tasks dhoondo jo logged-in user ke hain
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// 3. Task ko Update Karne ka Logic
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status } = req.body;

    const task = await Task.findOne({ _id: id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found or you're not authorized" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    task.status = status || task.status;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

// 4. Task ko Delete Karne ka Logic
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found or you're not authorized" });
    }
    
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };