import mongoose from 'mongoose';

const LeadInfoSchema = new mongoose.Schema(
  {
    is_unlocked: { type: Boolean, default: false },
    full_name: { type: String, default: null },
    whatsapp: { type: String, default: null },
    email: { type: String, default: null },
    captured_at: { type: Date, default: null }
  },
  { _id: false }
);

const GeneratedPrototypeSchema = new mongoose.Schema(
  {
    model_used: { type: String, default: null },
    html_body: { type: String, default: null },
    custom_css: { type: String, default: null },
    vanilla_js: { type: String, default: null }
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    user_session_id: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [
        'draft',
        'brand_defined',
        'capabilities_defined',
        'content_defined',
        'prototype_generated',
        'completed'
      ],
      default: 'draft'
    },
    current_phase: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    lead_info: {
      type: LeadInfoSchema,
      default: () => ({ is_unlocked: false })
    },
    master_json: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    generated_prototype: {
      type: GeneratedPrototypeSchema,
      default: () => ({})
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
