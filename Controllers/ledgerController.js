const {FriendsLedger, ShoppingLedger, BillTracker, StickyNotes} = require("../models/LedgerSchema")
const User = require("../models/UserSchema");
const {sendNotification, sendEmail} = require("./PushNotifications")


// Friends ledgers Controllers
const addFriendsLedger  = async (req, res) =>{
    const {UID, UName, title,desc,person_name,share,status,reg_num,SUID,amount,balanceAmount,transactionType,mode,transactionDate,transactionData,theme} = req.body;

    if(!UID || !title  || !person_name || !UName || !amount || !balanceAmount || !transactionType || !mode || !transactionDate || !transactionData || !theme){
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{ 

        //  console.log("inside the else loop")
        const ledger = new FriendsLedger({UID, UName, title,desc,person_name,share,status,reg_num,SUID,amount,balanceAmount,transactionType,mode,transactionDate,transactionData,theme});
        const data = await ledger.save(); 

        if(data?.SUID){
            const notifyUser = await User.findById({_id:data?.SUID})
            if(notifyUser){
    
                let subject = `Shared Ledger from ${data?.UName}`;
                let html =
                `Hi ${notifyUser?.firstName}, <br/><br/>
    
                you have a shared ledger from ${data?.UName} <br/><br/>
                
                <b>Title</b> - ${data?.title} <br/>
                <b>Link</b> - <a href="https://www.friendsledger.com/shared-ledger/${data?._id}">click here</a> <br/><br/><br/>

                Regards <br/>
                Friends Ledger
                `
    
                sendEmail(notifyUser?.email,subject,html) 
                
            }
            if(notifyUser?.FCM_Token?.length > 0){
                msgTitle=`You have a Shared ledger from ${UName}` 
                msgBody =`${title}`
                click_action = `https://www.friendsledger.com/shared-ledger/${data?._id}`
                sendNotification(notifyUser?.FCM_Token, msgTitle, msgBody, click_action)
            }
        }
        res.status(201).json({ message: "created successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong"});
    }
}

const addFriendsTransaction = async( req, res) =>{
    const {from,to, amount, balance, date, desc, mode, new_amount} = req.body;
    const _id = req.params.id

    if(!from || !to || !date  || !mode  ){
        // console.log(req.body)
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        //  console.log("inside the else loop")
        const ledger = await FriendsLedger.findById(_id)
        ledger.amount = new_amount
        ledger.balanceAmount = balance
        ledger.transactionData.unshift({ 
            from,
            to,
            amount,
            balance,
            date,
            desc,
            mode,
            new_amount
        })
        const data = await ledger.save();
        if(data?.SUID){
            const notifyUser = await User.findById({_id:data?.SUID})
            if(notifyUser?.FCM_Token?.length > 0){
                msgTitle=`Ledger Updated from ${data?.UName}`
                msgBody =`${data?.title}`
                click_action = `https://www.friendsledger.com/shared-ledger/${data?._id}`
                sendNotification(notifyUser?.FCM_Token, msgTitle, msgBody, click_action)
            }
        }

        res.status(201).json({ message: "successfully", data });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong"});
    }
}

const getAllFriendsLedger = async (req, res) =>{
    try {

        const _id = req.params.id;

        const ledgers = await FriendsLedger.find({$or:[{UID: _id}, {SUID: _id}]}).sort({ updatedAt: -1 }).exec();

        if(ledgers){
            res.status(200).json(ledgers);
        }else{
            // res.status(200).json({message: "no ledgers found"});
            res.status(200).json({message: "no ledgers found"});
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const getFriendsLedger = async (req, res) =>{
    try {

        const _id = req.params.id;
        let user1 = "";
        let user2 = "";

        const ledger = await FriendsLedger.findById(_id,{reg_num:0});
        if(ledger){
            if(ledger?.status){
                user1 = await User.findById({_id:ledger?.UID},{firstName:1,Profile_pic:1});
                if(ledger?.SUID !== ""){
                      user2 = await User.findById({_id:ledger?.SUID},{firstName:1, Profile_pic:1});
                }
    
                if(ledger?.status){
                    res.status(200).json({ledger, user1, user2}); 
                }else{
                    res.status(404).json({message:"no ledger found"});
                }
            }else{
                res.status(404).json({message:"no ledger found"});
            }
        }else{
            res.status(404).json({message:"no ledger found"});
        }
         
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "Oops something went wrong"});
    }
}

const deleteFriendsLedger = async (req,res) =>{
    try {

        const _id = req.params.id;

        const ledger = await FriendsLedger.findByIdAndDelete(_id);

        if(ledger){
            res.status(200).json({message:"deleted successfully"});
        }else{
            res.status(400).json({message: "couldn't delete the ledger"});
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const removeFriendsLedger = async (req,res) =>{
    try {

        const _id = req.params.id;

        const ledger = await FriendsLedger.findByIdAndUpdate(_id,{share:false,SUID:''});

        if(ledger){
            res.status(200).json({message:"removed successfully"});
        }else{
            res.status(400).json({message: "couldn't remove the ledger"});
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong" });
    }
}

const editFriendsLedger = async (req, res) =>{
    try {
        const _id = req.params.id;

        const {SUID ,title ,desc, share, reg_num,  S_pro_pic , theme, person_name} = req.body.data

        const oldLedger = await FriendsLedger.findById(_id)

        const ledger = await FriendsLedger.findByIdAndUpdate(_id,{SUID ,title ,desc, share, reg_num, 
            S_pro_pic , theme, person_name}, {new:true});
        

        if(oldLedger?.share === false && ledger?.share === true){
            const userData = await User.findById({_id : ledger?.SUID})
            
            let subject = `Shared Ledger from ${ledger?.UName}`;
            let html =
            `Hi ${userData?.firstName}, <br/><br/>

            you have a shared ledger from ${ledger?.UName} <br/><br/>

            <b>Title</b> - ${ledger?.title} <br/>
            <b>Link</b> - <a href="https://www.friendsledger.com/shared-ledger/${ledger?._id}">click here</a> <br/><br/><br/>

            Regards <br/>
            Friends Ledger
            `

            sendEmail(userData?.email,subject,html)

            if(userData?.FCM_Token?.length > 0){
                msgTitle=`You have a Shared ledger from ${ledger?.UName}`
                msgBody =`${title}`
                click_action = `https://www.friendsledger.com/shared-ledger/${ledger?._id}` 
                sendNotification(userData?.FCM_Token, msgTitle, msgBody, click_action)
            }

        }

        if(ledger){
            res.status(200).json({message:"Updated successfully"});
        }else{
            res.status(400).json({message: "couldn't Update the ledger"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong" });
    }
}

const toggleFriendsLedgerStatus = async (req, res) =>{
    try {
        const _id = req.params.id;
        const {status} = req.body
        const ledger = await FriendsLedger.findByIdAndUpdate(_id,{status:status});

        if(ledger){
            res.status(200).json({message:"Status updated successfully"});
        }else{
            res.status(400).json({message: "couldn't update the status"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong" });
    }
}

const editTransaction = async (req, res) => {
    const {from, to, amount, balance, date, desc, mode, new_amount} = req.body;
    const _id = req.params.id

    if(!from || !to || !date  || !mode  ){
        // console.log(req.body)
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        //  console.log("inside the else loop")
        const ledger = await FriendsLedger.findById(_id)
        ledger.transactionData.shift()
        ledger.amount = new_amount
        ledger.balanceAmount = balance
        ledger.transactionData.unshift({ 
            from,
            to,
            amount,
            balance,
            date,
            desc,
            mode
        })
        const data = await ledger.save();
        if(data?.SUID){
            const notifyUser = await User.findById({_id:data?.SUID})
            if(notifyUser?.FCM_Token?.length > 0){
                msgTitle=`Ledger Updated from ${data?.UName}`
                msgBody =`${data?.title}`
                click_action = `https://www.friendsledger.com/shared-ledger/${data?._id}`
                sendNotification(notifyUser?.FCM_Token, msgTitle, msgBody, click_action)
            }
        }

        res.status(201).json({ message: "successfully", data });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong"});
    }
}

const deleteTransaction = async (req, res) => {
    const _id = req.params.id
    const {balance, amount} = req.body;

    if(!balance  || !amount  ){
        // console.log(req.body)
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        //  console.log("inside the else loop")
        const ledger = await FriendsLedger.findById(_id)
        ledger.amount = amount
        ledger.balanceAmount = balance
        ledger.transactionData.shift()

        const data = await ledger.save();
        if(data?.SUID){
            const notifyUser = await User.findById({_id:data?.SUID})
            if(notifyUser?.FCM_Token?.length > 0){
                msgTitle=`Ledger Updated from ${data?.UName}`
                msgBody =`${data?.title}`
                click_action = `https://www.friendsledger.com/shared-ledger/${data?._id}`
                sendNotification(notifyUser?.FCM_Token, msgTitle, msgBody, click_action)
            }
        }

        res.status(201).json({ message: "successfully", data });

    } catch (err) {
        // console.log(err);
        res.status(500).json({ error: "something went wrong"});
    }
}

// Shopping ledgers Controllers
const addShoppingLedger  = async (req, res) =>{
    const {UID,title,desc,fixed,status,totalAmount,amount,balanceAmount,transactionData,theme} = req.body;

    if(!UID || !title || !theme){
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        //  console.log("inside the else loop")
        const ledger = new ShoppingLedger({UID,title,desc,fixed,status,totalAmount,amount,balanceAmount,transactionData,theme});
        const data = await ledger.save();
        res.status(201).json({ message: "successfully" , data});

    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const addShoppingTransaction  = async (req, res) =>{
    const {item_name,amount, balance, date, total, newBalance, mode} = req.body;
    const _id = req.params.id

    if(!item_name || !amount || !date || !total  ){
        return res.status(422).json({error : "Plz fill all the field"});
    }

    try{
        //  console.log("inside the shopping transaction")
        const ledger = await ShoppingLedger.findById(_id)
        ledger.totalAmount = total;
        ledger.balanceAmount = newBalance; 
            ledger.transactionData.unshift({ 
                item_name, amount, balance, date, mode, total_amount:total
            })
        await ledger.save();
        res.status(201).json({ message: "Item Added!!.." });

    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const deleteShoppingTransaction  = async (req, res) =>{
    const {total, newBalance} = req.body;
    const _id = req.params.id

    // if( !total  ){
    //     return res.status(422).json({error : "Plz fill all the field"});
    // }

    try{
        //  console.log("inside the shopping transaction")
        const ledger = await ShoppingLedger.findById(_id)
        ledger.totalAmount = total;
        ledger.balanceAmount = newBalance; 
        ledger.transactionData.shift()
        await ledger.save();
        res.status(201).json({ message: "Item Deleted!!.." });

    } catch (err) {
        console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const getAllShoppingLedger = async (req, res) =>{
    try {

        const _id = req.params.id;

        const ledgers = await ShoppingLedger.find({UID: _id}).sort({ updatedAt: -1 }).exec();

        if(ledgers){
            res.status(200).json(ledgers);
        }else{
            // res.status(200).json({message: "no ledgers found"});
            res.status(200).json({message: "no ledgers found"});
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const editShoppingLedger = async (req, res) =>{
    try {
        const _id = req.params.id;

        const { title ,desc, theme} = req.body

        const ledger = await ShoppingLedger.findByIdAndUpdate(_id,{title ,desc, theme}, {new:true});

        if(ledger){
            res.status(200).json({message:"Updated successfully"});
        }else{
            res.status(400).json({message: "couldn't Update the ledger"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const deleteShoppingLedger = async (req, res) =>{
    try {
        const _id = req.params.id;


        const ledger = await ShoppingLedger.findByIdAndDelete(_id);

        if(ledger){
            res.status(200).json({message:"Deleted successfully"});
        }else{
            res.status(400).json({message: "couldn't Delete the ledger"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const toggleShoppingLedgerStatus = async (req, res) =>{
    try {
        const _id = req.params.id;
        const {status} = req.body

        const ledger = await ShoppingLedger.findByIdAndUpdate(_id,{status:status});

        if(ledger){
            res.status(200).json({message:"Status updated successfully"});
        }else{
            res.status(400).json({message: "couldn't update the status"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

// Bill Tracker Controllers
const addBillTracker  = async (req, res) =>{
    const {UID,title,desc,fixed,status,totalAmount,amount,balanceAmount,transactionData,category,billDate,theme} = req.body;

    if(!UID || !title || !theme){
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        //  console.log("inside the else loop")
        const ledger = new BillTracker({UID,title,desc,fixed,status,totalAmount,amount,balanceAmount,billDate,transactionData,category,theme});
        const data = await ledger.save();
        res.status(201).json({ message: "successfully" });

    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const addBillTrackerTransaction  = async (req, res) =>{
    const {item_name,amount, balance, date, total, newBalance, mode} = req.body;
    const _id = req.params.id

    if(!item_name || !amount || !date || !total  ){
        return res.status(422).json({error : "Plz fill all the field"});
    }

    try{
        //  console.log("inside the shopping transaction")
        const ledger = await BillTracker.findById(_id)
        ledger.totalAmount = total;
        ledger.balanceAmount = newBalance; 
            ledger.transactionData.push({ 
                item_name, amount, balance, date, mode
            })
        await ledger.save();
        res.status(201).json({ message: "Item Added!!.." });

    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const getAllBillTracker = async (req, res) =>{
    try {

        const _id = req.params.id;

        const ledgers = await BillTracker.find({UID: _id}).sort({ updatedAt: -1 }).exec();

        if(ledgers){
            res.status(200).json(ledgers);
        }else{
            // res.status(200).json({message: "no ledgers found"});
            res.status(200).json({message: "no ledgers found"}); 
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const editBillTracker= async (req, res) =>{
    try {
        const _id = req.params.id;

        const { title ,desc, theme, category} = req.body

        const ledger = await BillTracker.findByIdAndUpdate(_id,{title ,desc, theme, category}, {new:true});

        if(ledger){
            res.status(200).json({message:"Updated successfully"});
        }else{
            res.status(400).json({message: "couldn't Update the ledger"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const deleteBillTracker = async (req, res) =>{
    try {
        const _id = req.params.id;


        const ledger = await BillTracker.findByIdAndDelete(_id);

        if(ledger){
            res.status(200).json({message:"Deleted successfully"});
        }else{
            res.status(400).json({message: "couldn't Delete the ledger"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}

const toggleBillTrackerStatus = async (req, res) =>{
    try {
        const _id = req.params.id;
        const {status} = req.body

        const ledger = await BillTracker.findByIdAndUpdate(_id,{status:status});
        
        if(ledger){
            res.status(200).json({message:"Status updated successfully"});
        }else{
            res.status(400).json({message: "couldn't update the status"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({ error: "something went wrong"});
    }
}


// Sticky Notes Controllers
const addStickyNotes  = async (req, res) =>{
    const {UID,title,desc, theme} = req.body;

    if(!UID || !title || !theme){
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        const ledger = new StickyNotes({UID, title, desc, theme});
        const data = await ledger.save();
        res.status(201).json({ message: "successfully Created" , data});
        
    } catch (err) {
        // console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const editStickyNotes  = async (req, res) =>{
    const {title,desc, theme} = req.body;
    const _id = req.params.id;

    if(!title || !theme){
        return res.status(422).json({error : "Plz fill all the field"});
    }
    
    try{

        //  console.log("inside the else loop")
        const data = await StickyNotes.findByIdAndUpdate(_id,{title ,desc, theme}, {new:true});
        res.status(201).json({ message: "successfully Edited" , data});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const getAllStickyNotes = async (req, res) =>{
    try {

        const _id = req.params.id;

        const notes = await StickyNotes.find({UID: _id}).sort({ updatedAt: -1 }).exec();

        if(notes){
            // console.log(notes[0]?.timestamps.currentTime())
            res.status(200).json(notes);
        }else{
            // res.status(200).json({message: "no ledgers found"});
            res.status(200).json({message: "no ledgers found"});
        }
        
    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}

const deleteStickyNote = async (req, res) =>{
    try {
        const _id = req.params.id;


        const ledger = await StickyNotes.findByIdAndDelete(_id);

        if(ledger){
            res.status(200).json({message:"Deleted successfully"});
        }else{
            res.status(400).json({message: "couldn't Delete the notes"});
        }
    } catch (err) {
        // console.log(err)
        res.status(500).json({error: "oops something went wrong!!.."})
    }
}






module.exports = {addFriendsLedger, addFriendsTransaction, editShoppingLedger,toggleFriendsLedgerStatus,
     getFriendsLedger, deleteFriendsLedger, getAllShoppingLedger, deleteShoppingLedger, toggleShoppingLedgerStatus,
    addShoppingLedger, addShoppingTransaction, getAllFriendsLedger, removeFriendsLedger, deleteTransaction,
     editFriendsLedger, addStickyNotes, getAllStickyNotes, editStickyNotes, deleteStickyNote,
     toggleBillTrackerStatus,deleteBillTracker,editBillTracker,getAllBillTracker,addBillTrackerTransaction,addBillTracker,
     deleteShoppingTransaction
    }