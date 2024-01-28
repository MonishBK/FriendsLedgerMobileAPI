const User = require("../models/UserSchema");
const {FriendsLedger, ShoppingLedger, StickyNotes} = require("../models/LedgerSchema")
const nodemailer = require("nodemailer")
const { ObjectId } = require('mongodb');
const bcrypt = require("bcryptjs")


const registerUser  = async (req, res) =>{
    const {firstName, lastName, email, number, password, DOB, gender, Profile_pic} = req.body;
    // console.log("inside the registerUser")
    
    if(!firstName || !lastName || !email || !number || !password || !DOB || !gender || !Profile_pic){
        // console.log("fill all data")
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        const userExist = await User.findOne({email : email});
        const userNum = await User.findOne({number: number});

        if( userExist ){
            // console.log("Email already exist")
            return res.status(409).json({error : "Email already exist",data: "email"});
        }else if( userNum ){
            // console.log("number already exist")
            return res.status(409).json({error : "number already exist", data: "number"});
        }else {
            // console.log("inside the else loop")
            const user = new User({firstName, lastName, email, number, password, DOB, gender, Profile_pic});
            await user.save();
            res.status(201).json({ message: "Register Successful" });
        }

    } catch (err) {
        // console.log(err);
        return res.status(500).json({error : "Oops something went wrong"});
    }
}

const signInUser = async (req, res) =>{
    try{

        let token; 
        const { email, number , password } = req.body;
        // const email = req.body.email;
        // console.log(email, number, "" === undefined, (!number || !password) &&  (!email || !password));

        if(email !== undefined){
        //    console.log("inside email ", email, password)
            if(email || password){
                var userLogin = await User.findOne( { email: email } );
            }

        }else if(number !== undefined){
            // console.log("inside number", number, password)
            if(number || password){
                var userLogin = await User.findOne( { number: number } );
            }

        }else{
            // console.log("in else statement")
            return res.status(400).json({error : "invalid login details"});
        } 

        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password);

            token = await userLogin.generateAuthToken();
            // console.log(token);

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            })
            // console.log("matching", isMatch)
            if(!isMatch){
                // console.log("inside is Match")
                res.status(400).json({ error : "Invalid Credential"});
            } else {
                res.status(200).json({ message : "user SignIn successfully!!..",token });
            }
        }else{
            // console.log("didn't get the user")
            res.status(400).json({ error : "Invalid Credential"}); 
        }


    } catch (err) {
        // console.log(err);
        res.status(500).json({ error :"Oops something went wrong"});
    }
}

const logOutUser = async (req, res) =>{
    try {
        // console.log(req.user.firstName);
        // console.log(req.user.tokens.length +" " + "before logout");

        // const email = req.user.email
        // for single logout in database
        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token !==  req.token;
        })

        // logout from all devices
        // req.user.tokens = []; 
        await req.user.save();
        

        // res.clearCookie("jwtoken", {path:'/'});
        res.clearCookie("jwtoken");
        // console.log(" logout Successfull!..");
        // console.log(req.user.tokens.length + " " + "after logout");

        res.status(200).json({ message : "user Logout successfully!!..", });
        // await req.user.save();
        // res.render("login");
    } catch (err) {
        console.log(err)
        res.status(500).json({ error : "user Logout Unsuccessfully!!..", });

    }
}

const LoutOutAllDevices = async (req, res) => {
    try {
        // console.log(req.user.firstName);
        // console.log(req.user.tokens.length +" " + "before logout");

        // const email = req.user.email
        // for single logout in database
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !==  req.token;
        // })

        // logout from all devices
        req.user.tokens = []; 
        await req.user.save();
        

        res.clearCookie("jwtoken", {path:'/'});
        // console.log(" logout Successfull!..");
        // console.log(req.user.tokens.length + " " + "after logout");

        res.status(200).json({ message : "user Logout successfully!!..", });
        // await req.user.save();
        // res.render("login");
    } catch (error) {
        res.status(500).json({ error : "user Logout Unsuccessfully!!..", });

    }
} 

const updateEmail = async (req, res) =>{
    try {
        const _id = req.params.id;
        const {email} = req.body;
        // console.log("inside the update",email)
        if(!email.trim()){
            return res.status(422).json({error : "Plz fill the field"});
        }
        // console.log("after inside")
        const userExist = await User.findOne({email});
        // console.log("after fetching", userExist)
        if( userExist ){
            // console.log("Email already exist")
            return res.status(409).json({error : "Email already exist"});
        }
        await User.findByIdAndUpdate( _id, {email},{
            new : true
        });
        res.status(201).json({ message: "email updated successfully"});
        // console.log("email Updated successfully")
    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const updateNumber = async (req, res) =>{
    try {
        const _id = req.params.id;
        const {number} = req.body;
        // console.log("inside the update",number)
        if(!number.trim()){
            return res.status(422).json({error : "Plz fill the field"});
        }
        // console.log("after inside")
        const userExist = await User.findOne({number});
        // console.log("after fetching", userExist);
        if( userExist ){
            // console.log("Number already exist")
            return res.status(409).json({error : "Number already exist"});
        }
        const updateEmail = await User.findByIdAndUpdate( _id, {number},{
            new : true
        });
        res.status(201).json({ message: "number updated successfully" });
        // console.log("number Updated successfully")
    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const UpdatePassword = async (req, res) =>{
    try {
        const _id = req.params.id;
        const {password, curr_password} = req.body;
        // console.log("from the req.body",password,curr_password)
        const updatePassword = await User.findById(_id)
        // console.log("inside the update password", updatePassword)
        if(updatePassword){
            // console.log("entered the if condition",curr_password, updatePassword.password);
            const isMatch = await bcrypt.compare(curr_password, updatePassword.password);
            // console.log("inside the updatePassword ")
            if(!isMatch){
                // console.log("couldn't match");
                res.status(400).json({ error : "current password wont match"});
            } else {
                // console.log("password matched")
                updatePassword.password = password
                updatePassword.save(); 
                res.status(201).json({ message: "password updated successfully" });
                // console.log("password Updated successfully");
            }
        }else{
            res.status(400).json({ error : "Invalid Credential"}); 
        }
    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const getUsers = async (req, res) => res.send(req.rootUser);

const deleteUserAccount = async (req, res) =>{
    try{

        const _id = req.params.id;
        const User_ID = _id;
        const {passDel} = req.body
        let password = passDel

        const UserLog = await User.findById(_id);
        
        const isMatch = await bcrypt.compare(password, UserLog.password);

        if(isMatch){  
    
            await FriendsLedger.deleteMany({UID: User_ID})
            await ShoppingLedger.deleteMany({UID: User_ID})
            await FriendsLedger.updateMany({SUID: User_ID},{SUID:'', share:false, reg_num:null})
            await StickyNotes.deleteMany({UID: User_ID})

            res.clearCookie("jwt", {path:'/'});
            await User.findByIdAndDelete(_id)
    
            res.status(201).json({ message: "Account is deleted successfully" });
            // console.log("Account is deleted successfully")
        }else{
            // console.log("password do not match")
            res.status(400).json({ error : "Invalid Credential"});
        }

    }catch(err){
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

// forgot password
const forgotPassword = async (req, res) =>{
    try {
        
        const {email} = req.body;
        const check = await User.findOne({email});

        // Function to generate OTP
        const generateOTP = () =>{
            var digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++ ) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            return Number(OTP); 
        }

        const DelOTP = async () =>{
            await User.findOneAndUpdate({email},{OTP:null})
            // console.log("OTP deleted successfull!!..")
        }

        if(check === null){
            res.status(422).json({ message: "No search results" });
        }else{
            // console.log(email)
            let otp = generateOTP()
            // console.log(otp)
            await User.findOneAndUpdate({email},{OTP:otp})
            // console.log("before set timeout") 

            let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth:{
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                    // pass: "lihsvaunergjxkbi" bkmonish17@gmailcom
                    // pass: "donotreply2000$"
                }
            })

            let details = {
                from:  `Friends Ledger <${process.env.EMAIL_ID}>`,
                to: email,
                subject: " FriendsLedger OTP ",
                html:
                `Hi ${check?.firstName}, <br/><br/>
                Please use the following OTP to reset your password <br/>
                <b>OTP:</b> ${otp} <br/><br/><br/>
                                
                Regards <br/>
                Friends Ledger                           `
            }

            mailTransporter.sendMail(details, (err) =>{
                if(err){
                    // console.log("error=> ",err)
                    res.status(422).json({ message: "Oops something went wrong!!.."  }); 
                }else{
                    // console.log("email has sent") 
                    setTimeout(DelOTP, 300000)
                    res.status(201).send({message: "otp sent successfully!!.."});
                } 
            })


            // console.log("after set timeout")
            // let options = `${otp} is your placement Online Portal code `
            
        }

    } catch (err) {
        res.status(500).json({ error: "Oops Something Went Wrong!!.." }); 
    }

}

const matchOTP = async(req, res) =>{
    try {
        // console.log("inside the otp-match")
        const {OTP,email} = req.body;
        // console.log(req.body)
        const check = await User.findOne({email});

        if(check === null){
            // console.log("invalid email")
            res.status(422).json({error: "invalid email"})
        }else{
            if(check.OTP === Number(OTP)){
                await User.findOneAndUpdate({email},{OTP:null})
                res.status(200).json({message: "OTP Verified!!.."})
            }else{
                res.status(422).json({message: "Invalid OTP!!.."})
            }
        }

    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const changePasswordOTP = async (req, res) =>{
    try {
        // console.log("inside change-otp-pass")
        const {password, cpassword, email} = req.body;
        const updatePassword = await User.findOne({email})

        if(updatePassword){
            if(!password || !cpassword){
                return res.status(422).json({error : "Plz fill all the field"});
            }
            updatePassword.password = password
            // updatePassword.cpassword = cpassword
            updatePassword.save(); 
            res.status(201).json({ message: "password changed successfully" });
            // console.log("password changed successfully");
        }else{
            // console.log("Oops No User Found ")
        res.status(400).json({error: "Oops Email did't match"})
        }

    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const updateProfile = async (req, res) =>{
    try {
        
        const _id = req.params.id;
        const {Profile_pic, firstName, lastName,DOB, gender} = req.body;

        const profile = await User.findByIdAndUpdate(_id,{Profile_pic, firstName, lastName,DOB, gender},{new: true})
        res.status(201).json({ message: "Profile updated successfully" });

    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})

    }
}

const getAllUsers = async (req,res) =>{
    try {

        const usersData = await FriendsLedger.find({$or:[{UID:req.userID}, {SUID:req.userID}]},{SUID:1, UID:1, _id:0})
        const uniqueIds = new Set();
        // const users = usersData.filter(({ SUID }) => {return SUID !== "" }).map(({ SUID }) => new ObjectId(SUID));
        const users = usersData.filter(({ SUID, UID }) => SUID !== "" || UID !== "")
        .forEach(({ SUID, UID }) => {
          if (SUID !== "" && !uniqueIds.has(SUID)) {
            uniqueIds.add(SUID);
          }
      
          if (UID !== "" && !uniqueIds.has(UID)) {
            uniqueIds.add(UID);
          }
        });
       
        const uniqueRes = Array.from(uniqueIds).map((id) => ({ _id: new ObjectId(id) }));
        
        // console.log("uniqic id => ",uniqueIds)
        // console.log("res => ",uniqueRes)
        const data = await User.find({_id:uniqueRes},{firstName:1,Profile_pic:1})
        // console.log("data => ",data)

        res.status(200).json(data);
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const getSingleUser = async (req,res) =>{
    try {
        const data = await User.find({email: req.body.email},{firstName:1,lastName:1,Profile_pic:1,email:1})
        // console.log(data)
        
        if(data.length > 0){
            res.status(200).json(data);
        }else{
            res.status(404).json({error:"User not found"})
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops Something went wrong!!.."})
    }
}

const getUserByNumber = async (req,res) =>{
    try {

        const {num} = req.params
        
        const data = await User.findOne({number: num},{firstName:1,Profile_pic:1})

        if(data){
            res.status(200).json(data);
        }else{
            res.status(404).json({error:"User not found"})
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const putFCMToken = async (req,res) =>{
    try {

        const _id = req.params.id
        const {token} = req.body
        
        // console.log(_id, token)

        const user = await User.findById(_id)
        if(user){
            if(!user.FCM_Token.includes(token)){
                user.FCM_Token.push(token)
                user.save()
            }
        }

        res.status(200).json({success: true});
        
    } catch (err) {
        console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

 

module.exports = 
{registerUser, 
    signInUser, 
    logOutUser, 
    LoutOutAllDevices, 
    updateEmail, 
    updateNumber, 
    UpdatePassword, 
    getUsers, 
    deleteUserAccount,
    forgotPassword,
    matchOTP,
    changePasswordOTP,
    updateProfile,
    getAllUsers,
    getSingleUser,
    getUserByNumber,
    putFCMToken
}