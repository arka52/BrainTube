import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
    },
    videoLink: {
        type: String,
        required: true,
    },
    videoTitle: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['quiz', 'summary', 'laq'],
        required: true
    },
    questionRef: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'type'
    }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

export { Question }