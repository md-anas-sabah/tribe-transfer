import { Request, Response } from "express";
import Handover from "../models/handover.model";
import User from "../models/user.model";
import Knowledge from "../models/knowledge.model";
import { generateKnowledgeSummary } from "../services/ai.service";

// @desc    Create a new handover
// @route   POST /api/handovers
// @access  Private (Admin, Manager)
export const createHandover = async (req: Request, res: Response) => {
  try {
    const { employee, exitDate, status, successor } = req.body;

    // Check if employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if successor exists if provided
    if (successor) {
      const successorExists = await User.findById(successor);
      if (!successorExists) {
        return res.status(404).json({
          success: false,
          message: "Successor not found",
        });
      }
    }

    // Create handover
    const handover = await Handover.create({
      employee,
      exitDate,
      status: status || "planned",
      successor,
    });

    res.status(201).json({
      success: true,
      data: handover,
    });
  } catch (error) {
    console.error("Create handover error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all handovers
// @route   GET /api/handovers
// @access  Private
export const getAllHandovers = async (req: Request, res: Response) => {
  try {
    // Add filtering capability
    const filter: any = {};

    // If status is provided in query
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // If employee is provided in query
    if (req.query.employee) {
      filter.employee = req.query.employee;
    }

    const handovers = await Handover.find(filter)
      .populate("employee", "name email position department")
      .populate("successor", "name email position department")
      .sort({ exitDate: 1 });

    res.status(200).json({
      success: true,
      count: handovers.length,
      data: handovers,
    });
  } catch (error) {
    console.error("Get all handovers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get a single handover
// @route   GET /api/handovers/:id
// @access  Private
export const getHandoverById = async (req: Request, res: Response) => {
  try {
    const handover = await Handover.findById(req.params.id)
      .populate("employee", "name email position department")
      .populate("successor", "name email position department")
      .populate("knowledgeItems.knowledge");

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: "Handover not found",
      });
    }

    res.status(200).json({
      success: true,
      data: handover,
    });
  } catch (error) {
    console.error("Get handover error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a handover
// @route   PUT /api/handovers/:id
// @access  Private
export const updateHandover = async (req: Request, res: Response) => {
  try {
    // Check if handover exists
    let handover = await Handover.findById(req.params.id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: "Handover not found",
      });
    }

    // Update handover
    handover = await Handover.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: handover,
    });
  } catch (error) {
    console.error("Update handover error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a handover
// @route   DELETE /api/handovers/:id
// @access  Private (Admin)
export const deleteHandover = async (req: Request, res: Response) => {
  try {
    const handover = await Handover.findById(req.params.id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: "Handover not found",
      });
    }

    await handover.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete handover error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Conduct exit interview
// @route   POST /api/handovers/:id/interview
// @access  Private
export const conductInterview = async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: "Interview transcript is required",
      });
    }

    const handover = await Handover.findById(req.params.id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: "Handover not found",
      });
    }

    // Update handover with transcript and interview date
    handover.interviewTranscript = transcript;
    handover.interviewDate = new Date();
    await handover.save();

    res.status(200).json({
      success: true,
      data: handover,
    });
  } catch (error) {
    console.error("Conduct interview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Generate summary from interview
// @route   POST /api/handovers/:id/summary
// @access  Private
export const generateSummary = async (req: Request, res: Response) => {
  try {
    const handover = await Handover.findById(req.params.id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: "Handover not found",
      });
    }

    if (!handover.interviewTranscript) {
      return res.status(400).json({
        success: false,
        message: "No interview transcript found. Conduct an interview first.",
      });
    }

    // Generate summary using AI service
    const summary = await generateKnowledgeSummary(
      handover.interviewTranscript
    );

    // Update handover with summary
    handover.interviewSummary = summary;
    await handover.save();

    res.status(200).json({
      success: true,
      data: {
        summary,
        handover,
      },
    });
  } catch (error) {
    console.error("Generate summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
