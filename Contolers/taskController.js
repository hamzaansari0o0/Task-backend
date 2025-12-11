// backend/Contolers/taskController.js

const Task = require("../Models/taskModel");
const cloudinary = require("../config/cloudinary");

// createTask, getTasks, updateTask, and deleteTask are already correct and need no changes.
const createTask = async (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        const newTask = new Task({ title, description, deadline, user: req.user.id });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: "Failed to create task", error: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, deadline, removeFile } = req.body;
        const task = await Task.findOne({ _id: id, user: req.user.id });
        if (!task) {
          return res.status(404).json({ message: "Task not found or you're not authorized" });
        }
        if (removeFile && task.filePublicId) {
          await cloudinary.uploader.destroy(task.filePublicId, { resource_type: "raw" });
          task.fileUrl = null;
          task.filePublicId = null;
          task.originalFilename = null;
          task.status = "Pending";
        }
        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.deadline = deadline ?? task.deadline;
        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
      } catch (error) {
        res.status(500).json({ message: "Failed to update task", error: error.message });
      }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id, user: req.user.id });
        if (!task) {
          return res.status(404).json({ message: "Task not found or you're not authorized" });
        }
        if (task.filePublicId) {
          await cloudinary.uploader.destroy(task.filePublicId, { resource_type: "raw" });
        }
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: "Task and associated file deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete task", error: error.message });
      }
};

// Task File Upload Karne Ka Logic (✅ SIMPLIFIED)
const uploadTaskFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found or you're not authorized" });
    }
    if (task.deadline && new Date() > new Date(task.deadline)) {
        return res.status(400).json({ message: "Deadline has passed. You cannot upload now." });
    }

    if (task.filePublicId) {
      await cloudinary.uploader.destroy(task.filePublicId, { resource_type: "raw" });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "task_files", resource_type: "raw" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // ✅✅✅ FINAL FIX: Only save the original, clean URL. No modifications.
    task.fileUrl = result.secure_url;
    task.filePublicId = result.public_id;
    task.status = "Complete";
    task.originalFilename = req.file.originalname;
    
    const updatedTask = await task.save();

    res.status(200).json({
      message: "File uploaded and task completed successfully! ✅",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, uploadTaskFile };