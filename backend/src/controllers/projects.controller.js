import { MasterJsonSchema } from '@webcreator/shared';
import { Project } from '../models/Project.model.js';
import { runConsultantAgent } from '../agents/consultantAgent.js';
import { generateLogoOptions } from '../tools/brandTools.js';

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

export const handleProjectChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    let agentResult;
    try {
      agentResult = await runConsultantAgent({
        message,
        currentMasterJson: project.master_json || {}
      });
    } catch (agentError) {
      // Interceptar error Zod ante alucinaciones de la IA (Caso 2 SDD)
      if (agentError.name === 'ZodError' || agentError.issues) {
        return res.status(422).json({
          success: false,
          error: 'Error de validación SDD en argumentos de IA',
          issues: agentError.issues || agentError.message
        });
      }
      throw agentError;
    }

    const { reply, tool_executed, validated_data } = agentResult;

    if (tool_executed === 'setBrandIdentity' && validated_data) {
      const currentMaster = project.master_json || {};
      const updatedMaster = {
        ...currentMaster,
        project_meta: {
          ...(currentMaster.project_meta || {}),
          ...validated_data.project_meta
        },
        branding: {
          ...(currentMaster.branding || {}),
          ...validated_data.branding
        }
      };

      project.master_json = updatedMaster;
      project.status = 'brand_defined';
      project.current_phase = 2;
      await project.save();
    }

    return res.status(200).json({
      success: true,
      reply,
      tool_executed,
      project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getProjectLogoOptions = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, sector, primary_color } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const bName = business_name || project.master_json?.project_meta?.business_name || 'Mi Negocio';
    const bSector = sector || project.master_json?.project_meta?.sector || 'General';
    const pColor = primary_color || project.master_json?.branding?.colors?.primary || '#4A2E1B';

    const logoOptions = await generateLogoOptions({
      businessName: bName,
      sector: bSector,
      primaryColor: pColor
    });

    return res.status(200).json({
      success: true,
      logo_options: logoOptions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
