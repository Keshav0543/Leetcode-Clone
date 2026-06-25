import axios from "axios";

const getlanguageId = (lang) => {
  lang = lang.toLowerCase();
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };
  if (!(lang in language)) throw new Error("Language not supported...");
  return language[lang];
};

const submitBatch = async (submissions) => {
  try {
    const options = {
      method: "POST",
      url: "https://ce.judge0.com/submissions/batch",
      params: {
        base64_encoded: "false",
        wait:"true",
        fields: "stdout,stderr,status_id,status,token,time,memory,compile_output,message,expected_output,stdin"
      },
      headers: {
        "content-type": "application/json",
      },
      data: {
        submissions: submissions,
      },
    };

    const response = await axios(options);
    return response.data;
  } catch (err) {
    throw new Error("Judge0 batch submission failed: " + err.message);
  }
};

const submitToken = async (resultToken) => {
  const token = resultToken.join(",");
  try {
    while (1) {
      const result = await axios.get(
        `https://ce.judge0.com/submissions/batch`,
        {
          params: {
            tokens: token,
            base64_encoded: "false",
            fields: "stdout,stderr,status_id,status,token,time,memory,compile_output,message,expected_output,stdin"
          },
        }
      );
      const results = result.data.submissions;
      const isCompleted = results.every((ans) => ans.status.id > 2);
      if (isCompleted) return results;
      await waiting(2000);
    }
  } catch (err) {
    throw new Error("Judge0 batch Tokenizer Step failed: " + err.message);
  }
};

const waiting=async (timer)=>{
  return  new Promise((resolve)=>{
    setTimeout(()=>resolve(1),timer)
  });
}

export  { getlanguageId, submitBatch, submitToken };
