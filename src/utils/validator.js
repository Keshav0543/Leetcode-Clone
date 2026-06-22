import validator from "validator";

const validate= (data)=>{

    const mandatoryFields=['firstName','password','emailId'];
    const isAllowed=mandatoryFields.every((k)=> Object.keys(data).includes(k));
 
    if(!isAllowed)throw new Error("Field is Missing...");

    if(!validator.isEmail(data.emailId))throw new Error("Notvalid Email ");
    if(!validator.isStrongPassword(data.password))throw new Error("Password is to weak...");
    if(data.firstName.length<3 || data.firstName.length>20)throw new Error("FirstName atleast require 3 char and less than 20...");
}

export default validate;