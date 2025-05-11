import { Request, Response } from "express";
import mongoose from "mongoose";
import Knowledge from "../models/knowledge.model";

// @desc    Create a new knowledge item
// @route   POST /api/knowledge
// @access  Private
export const createKnowledge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    // Add current user as owner
    req.body.owner = req.user.id;

    // Create knowledge item
    const knowledge = await Knowledge.create(req.body);

    res.status(201).json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("Create knowledge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all knowledge items
// @route   GET /api/knowledge
// @access  Private
export const getAllKnowledge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    // Build filter object
    const filter: Record<string, any> = {};

    // Filter by category if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by tag if provided
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }

    // Filter by importance if provided
    if (req.query.importance) {
      filter.importance = req.query.importance;
    }

    // Filter by owner if provided
    if (req.query.owner) {
      filter.owner = req.query.owner;
    }

    // Show private knowledge only to owner or admin
    if (req.user.role !== "admin") {
      filter.$or = [{ isPrivate: false }, { owner: req.user.id }];
    }

    const knowledge = await Knowledge.find(filter)
      .populate("owner", "name email")
      .populate("contributors", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: knowledge.length,
      data: knowledge,
    });
  } catch (error) {
    console.error("Get all knowledge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get a single knowledge item
// @route   GET /api/knowledge/:id
// @access  Private
export const getKnowledgeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const knowledge = await Knowledge.findById(req.params.id)
      .populate("owner", "name email position")
      .populate("contributors", "name email position");

    if (!knowledge) {
      res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
      return;
    }

    // Check if user has access to private knowledge
    if (
      knowledge.isPrivate &&
      knowledge.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to access this knowledge item",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("Get knowledge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a knowledge item
// @route   PUT /api/knowledge/:id
// @access  Private
export const updateKnowledge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    let knowledge = await Knowledge.findById(req.params.id);

    if (!knowledge) {
      res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
      return;
    }

    // Check ownership or admin role
    if (
      knowledge.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this knowledge item",
      });
      return;
    }

    // Add user to contributors if not the owner and not already a contributor
    if (knowledge.owner.toString() !== req.user.id) {
      const contributorExists = knowledge.contributors.some(
        (contributor) => contributor.toString() === req.user?.id
      );

      if (!contributorExists && req.user.id) {
        knowledge.contributors.push(new mongoose.Types.ObjectId(req.user.id));
      }
    }

    // Update knowledge item
    knowledge = await Knowledge.findByIdAndUpdate(
      req.params.id,
      { ...req.body, contributors: knowledge.contributors },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!knowledge) {
      res.status(404).json({
        success: false,
        message: "Knowledge item not found after update",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("Update knowledge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a knowledge item
// @route   DELETE /api/knowledge/:id
// @access  Private
export const deleteKnowledge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const knowledge = await Knowledge.findById(req.params.id);

    if (!knowledge) {
      res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
      return;
    }

    // Check ownership or admin role
    if (
      knowledge.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this knowledge item",
      });
      return;
    }

    await knowledge.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete knowledge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Search knowledge items
// @route   GET /api/knowledge/search
// @access  Private
export const searchKnowledge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const { query } = req.query;

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    // Create search filter
    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(String(query), "i")] } },
      ],
    };

    // Add privacy filter
    const filter: any = {
      $and: [
        searchFilter,
        {
          $or: [{ isPrivate: false }, { owner: req.user.id }],
        },
      ],
    };

    // Allow admins to see all results
    if (req.user.role === "admin") {
      filter.$and = [searchFilter];
    }

    const knowledge = await Knowledge.find(filter)
      .populate("owner", "name email")
      .populate("contributors", "name email")
      .sort({ importance: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: knowledge.length,
      data: knowledge,
    });
  } catch (error) {
    console.error("Search knowledge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
