const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    file: { url: String, key: String },
    link: { type: String },
    materialType: { type: String, enum: ['pdf', 'video', 'link', 'notes'], default: 'pdf' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
