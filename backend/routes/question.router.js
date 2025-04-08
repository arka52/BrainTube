import express from 'express';

const questionRouter = express.Router();
/**
 * Function to retrieve subtitles for a given YouTube video.
 * @param {Object} questionobj - The main object containing the question details
 * @param {String} questionobj.quiz - The quiz question
 * @param {String} questionobj.laq - The laq question
 * @param {String} questionobj.summary - The summary question
 * @param {Object} questionobj.options - The options for the quiz question
 * @param {Number} questionobj.connrectIndex - The index of the correct answer in the options
 * @param {Object} questionobj.answer - The answer for the laq or summary question
 * @param {String} questionobj.answer.text - The text of the answer
 * @param {String} type - the type of question (e.g., 'quiz', 'laq', 'summary')
 * @param {Object} videobj - The video object containing video details
 * @param {String} videobj.videoId - The ID of the video
 * @param {String} videobj.videoLink - The link to the video
 * @param {String} videobj.videoTitle - The title of the video
 */
questionRouter.post('/addquestion', async (req, res) => {
    const {type, videobj, questionobj} = req.body;

    if (!type || !videobj || !questionobj) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    //authenticate header,get the id from the token
    //from middlewware

    const fetchedUser = req.user

    if(!fetchedUser){
        return res.status(401).json({ message: "Please authenticate using a valid token" });
    }

    if(type === "quiz"){
        const { quiz } = questionobj;
        if (!quiz) {
            return res.status(400).json({ message: "Please provide quiz question" });
        }
    }else if(type === "laq"){
        const { laq } = questionobj;
        if (!laq) {
            return res.status(400).json({ message: "Please provide laq question" });
        }
    }else if(type === "summary"){
        const { summary } = questionobj;
        if (!summary) {
            return res.status(400).json({ message: "Please provide summary question" });
        }
    }
})
