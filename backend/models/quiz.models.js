import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    question:{
        type:String
    },
    options:[{
        type:String
    }],
    connrectIndex:{
        type:Number
    },
},{timestamps: true});

const QuizModel = mongoose.model("Quiz", quizSchema);

export { QuizModel };