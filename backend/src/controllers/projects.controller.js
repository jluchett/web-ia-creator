import { MasterJsonSchema } from '@webcreator/shared';
import { Project } from '../models/Project.model.js';

const PartialMasterJsonSchema = MasterJsonSchema.deepPartial();

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

export const createProject = async (req, res) => {
  try {
    const { user_session_id } = req.body;
    const sessionId = user_session_id || `sess_${Math.random().toString(36).substring(2, 10)}`;

    const project = await Project.create({
      user_session_id: sessionId,
      status: 'draft',
      current_phase: 1,
      master_json: {}
    });

    return res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateMasterJson = async (req, res) => {
  try {
    const { id } = req.params;

    const validationResult = PartialMasterJsonSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.issues
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const currentMasterJson = project.master_json || {};
    const updatedMasterJson = mergeDeep(currentMasterJson, validationResult.data);

    const updated = await Project.findByIdAndUpdate(
      id,
      { $set: { master_json: updatedMasterJson } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updated || project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
