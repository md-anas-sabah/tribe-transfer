import { Request, Response } from "express";
import SPOF from "../models/spof.model";
import User from "../models/user.model";
import Knowledge from "../models/knowledge.model";
import { detectSpofs } from "../services/ai.service";

// @desc    Analyze and create SPOF entries
// @route   POST /api/spof/analyze
// @access  Private (Admin, Manager)
export const analyzeSpof = async (req: Request, res: Response) => {
  try {
    // Get all users
    const users = await User.find({ isActive: true });

    // Get all knowledge items
    const knowledgeItems = await Knowledge.find()
      .populate("owner", "name email department position")
      .populate("contributors", "name email department position");

    // Group knowledge by owner
    const knowledgeByUser = users.map((user: any) => {
      // Filter knowledge items owned by this user
      const ownedKnowledge = knowledgeItems.filter(
        (item) => item.owner._id.toString() === user._id.toString()
      );

      // Filter knowledge items where user is a contributor
      const contributedKnowledge = knowledgeItems.filter((item) =>
        item.contributors.some(
          (contributor) => contributor._id.toString() === user._id.toString()
        )
      );

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          position: user.position,
        },
        ownedKnowledge,
        contributedKnowledge,
      };
    });

    // Use AI to detect SPOFs
    const spofAnalysis = await detectSpofs(knowledgeByUser);

    // Store SPOF analysis for each user
    const spofResults = [];

    for (const analysis of spofAnalysis) {
      // Check if SPOF already exists for this user
      let spof = await SPOF.findOne({ employee: analysis.userId });

      if (spof) {
        // Update existing SPOF
        spof.knowledgeAreas = analysis.knowledgeAreas;
        spof.riskScore = analysis.riskScore;
        spof.backupPeople = analysis.backupPeople;
        spof.lastUpdated = new Date();
        await spof.save();
      } else {
        // Create new SPOF
        spof = await SPOF.create({
          employee: analysis.userId,
          knowledgeAreas: analysis.knowledgeAreas,
          riskScore: analysis.riskScore,
          backupPeople: analysis.backupPeople,
          autoDetected: true,
          lastUpdated: new Date(),
        });
      }

      spofResults.push(spof);
    }

    res.status(200).json({
      success: true,
      count: spofResults.length,
      data: spofResults,
    });
  } catch (error) {
    console.error("Analyze SPOF error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all SPOFs
// @route   GET /api/spof
// @access  Private
export const getAllSpofs = async (req: Request, res: Response) => {
  try {
    const spofs = await SPOF.find()
      .populate("employee", "name email department position")
      .populate("backupPeople.user", "name email department position")
      .populate("knowledgeAreas.relatedItems")
      .sort({ riskScore: -1 });

    res.status(200).json({
      success: true,
      count: spofs.length,
      data: spofs,
    });
  } catch (error) {
    console.error("Get all SPOFs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get a single SPOF
// @route   GET /api/spof/:id
// @access  Private
export const getSpofById = async (req: Request, res: Response) => {
  try {
    const spof = await SPOF.findById(req.params.id)
      .populate("employee", "name email department position")
      .populate("backupPeople.user", "name email department position")
      .populate("knowledgeAreas.relatedItems");

    if (!spof) {
      return res.status(404).json({
        success: false,
        message: "SPOF not found",
      });
    }

    res.status(200).json({
      success: true,
      data: spof,
    });
  } catch (error) {
    console.error("Get SPOF error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a SPOF
// @route   PUT /api/spof/:id
// @access  Private
export const updateSpof = async (req: Request, res: Response) => {
  try {
    // Find SPOF
    let spof = await SPOF.findById(req.params.id);

    if (!spof) {
      return res.status(404).json({
        success: false,
        message: "SPOF not found",
      });
    }

    // Update SPOF
    spof = await SPOF.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date(), autoDetected: false },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: spof,
    });
  } catch (error) {
    console.error("Update SPOF error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a SPOF
// @route   DELETE /api/spof/:id
// @access  Private (Admin)
export const deleteSpof = async (req: Request, res: Response) => {
  try {
    const spof = await SPOF.findById(req.params.id);

    if (!spof) {
      return res.status(404).json({
        success: false,
        message: "SPOF not found",
      });
    }

    await spof.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete SPOF error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
