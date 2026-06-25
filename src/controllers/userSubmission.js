import problem from "../models/problem.js";
import SubmissionS from "../models/Submission.js";
import Problemutility from "../utils/Problemutility.js";

const SubmitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;
    if (!userId || !problemId || !code || !language)
      return res.status(400).send("Field is Missing...");

    //Fetch The Problem
    const Problem = await problem.findById(problemId);
    //Now we have test cases from above

    const SubmittedResult = await SubmissionS.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed: 0,
      totalTestCases: Problem.invisibleTestcases.length,
      status: "pending",
    });

    //Judge0 Submission
    const LangId = Problemutility.getlanguageId(language);
    const submission = [];
    for (const data of Problem.invisibleTestcases) {
      submission.push({
        source_code: code,
        language_id: LangId,
        stdin: data.input,
        expected_output: data.output,
      });
    }

    const submitResult = await Problemutility.submitBatch(submission);
    const resultToken=submitResult.map((value)=>value.token);
    const FinalResult = await Problemutility.submitToken(resultToken);

    //Submitted Result Update karo
    let testCasesPassed=0;
    let runtime=0;
    let memory=0;
    let status="Accepted";
    let errorMessage=null;

    for(const result of FinalResult){
      if(result.status_id==3){
        testCasesPassed++;
        runtime+=parseFloat(result.time)*1000;
        memory=Math.max(result.memory,memory);
      }
      else{
        if(result.status_id==4){
          status="error";
          errorMessage=result.stderr;
        }
        else{
          status="wrong";
          errorMessage=result.stderr;
        }
      }
    }

    //Store the result in Database
    SubmittedResult.status=status;
    SubmittedResult.testCasesPassed=testCasesPassed;
    SubmittedResult.runtime=runtime;
    SubmittedResult.memory=memory;
    SubmittedResult.errorMessage=errorMessage;

    await SubmittedResult.save();
    res.status(201).send("Submitted_Result...");

  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};


export default { SubmitCode };
