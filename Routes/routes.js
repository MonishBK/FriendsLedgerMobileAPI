const express = require('express');
const router = express.Router();
const Authenticate = require("../middlewares/authenticate")

const { registerUser,signInUser, logOutUser, LoutOutAllDevices, updateEmail, updateNumber, updateProfile, 
    UpdatePassword, getUsers, deleteUserAccount, getAllUsers, getSingleUser, getUserByNumber, putFCMToken,
    forgotPassword, matchOTP, changePasswordOTP } = require('../Controllers/userControllers');

const {addFriendsLedger, addFriendsTransaction, getAllFriendsLedger, getAllShoppingLedger, toggleFriendsLedgerStatus,
     getFriendsLedger, deleteFriendsLedger,editShoppingLedger,deleteShoppingLedger, removeFriendsLedger,
     toggleShoppingLedgerStatus, addStickyNotes, getAllStickyNotes, editStickyNotes, deleteStickyNote,
     addShoppingLedger, addShoppingTransaction, editFriendsLedger, toggleBillTrackerStatus, deleteBillTracker,
     editBillTracker, getAllBillTracker, addBillTrackerTransaction, deleteTransaction, deleteShoppingTransaction,
     addBillTracker} = require("../Controllers/ledgerController")

const {sendNotification} = require("../Controllers/PushNotifications")

// ===================== User API =======================

// user Registration 
router.post('/register', registerUser);

// user login 
router.post("/signIn", signInUser); 

// user Logout
router.get("/logout", Authenticate , logOutUser);

// user Logout All
router.get("/logout-all-devices", Authenticate , LoutOutAllDevices);

// Update Email
router.patch("/update-email/:id", updateEmail);

// Update Number
router.patch("/update-number/:id", updateNumber);

// Update Password
router.patch("/update-pass/:id", UpdatePassword);

// Update profile
router.patch("/update-profile/:id", updateProfile);

//user data fetching
router.get('/user-data-fetch', Authenticate , getUsers); 

// Delete User Account
router.delete("/user/delete-acc/:id", deleteUserAccount);

// get single user 
router.post("/forgot-password-user", getSingleUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Matching the OTP
router.post("/check-otp-match", matchOTP);

// Changing Password using OTP
router.post("/change-pass-otp", changePasswordOTP);

// get All users
router.post("/get-all-users", Authenticate,  getAllUsers);

// check user by number
router.post("/get-user-number/:num",  getUserByNumber);

// Add FCM Token
router.patch("/fcm-token/:id", putFCMToken );



// ============================ Friends Ledger API =============================

// add friends ledger
router.post("/add-friends-ledger" ,addFriendsLedger)

// add friends ledger
router.post("/edit-friends-ledger/:id" ,editFriendsLedger)

// delete friends ledger
router.delete("/delete-friends-ledger/:id" ,deleteFriendsLedger)

// remove friends ledger
router.patch("/remove-friends-ledger/:id" ,removeFriendsLedger)

// add friends ledger transaction
router.post("/add-friends-transaction/:id" ,addFriendsTransaction)

// get all friends ledger Data
router.post("/friends-ledgers-data/:id" ,getAllFriendsLedger)

// get friends ledger Data (single)
router.post("/friends-ledger/:id" ,getFriendsLedger)

// toggle Friends ledger status 
router.patch("/toggle-friends-ledger-status/:id" ,toggleFriendsLedgerStatus)

// delete friends ledger transaction
router.delete("/delete-friends-ledger-transaction/:id" ,deleteTransaction)


// ================================= Shopping Ledger API =============================

// add shopping ledger 
router.post("/add-shopping-ledger" ,addShoppingLedger)

// add shopping ledger transaction
router.post("/add-shopping-transaction/:id" ,addShoppingTransaction)

// get all Shopping ledger Data
router.post("/friends-shopping-data/:id" ,getAllShoppingLedger)

// edit Shopping ledger Data
router.patch("/edit-shopping-ledger/:id" ,editShoppingLedger)

// delete Shopping ledger Data
router.delete("/delete-shopping-ledger/:id" ,deleteShoppingLedger)

// toggle Shopping ledger status 
router.patch("/toggle-shopping-ledger-status/:id" ,toggleShoppingLedgerStatus)

// delete shopping ledger transaction
router.delete("/delete-shopping-ledger-transaction/:id" ,deleteShoppingTransaction)

// ================================= Bill Tracker API =============================

// add shopping ledger 
router.post("/add-bill-tracker" ,addBillTracker)

// add bill tacker transaction
router.post("/add-bill-tracker-transaction/:id" ,addBillTrackerTransaction)

// toggle bill tracker status 
router.patch("/toggle-bill-tracker-status/:id" ,toggleBillTrackerStatus)

// get all bill tracker Data
router.post("/get-bill-tracker-data/:id" ,getAllBillTracker)

// edit bill tracker Data
router.patch("/edit-bill-tracker/:id" ,editBillTracker)

// delete bill tracker Data
router.delete("/delete-bill-tracker/:id" ,deleteBillTracker)




// ======================= Sticky Notes API ==========================

// add Sticky Notes
router.post("/add-sticky-notes" ,addStickyNotes)

// edit Sticky Notes
router.patch("/edit-sticky-notes/:id" ,editStickyNotes)

// get all Sticky Notes
router.post("/sticky-notes-data/:id" ,getAllStickyNotes)

// delete Sticky Notes
router.delete("/delete=sticky-notes/:id" ,deleteStickyNote)


router.post("/send-message", async(req, res) =>{
    try {
        // console.log("reached here")
        // const fcmtoken = "dodi_ECjfWT8O-L-KkRa8h:APA91bHmzSMZakTx3dPYQsH-Q0-dgvwlee707de66T4oIusSH0vfexs2gFfUII6w9jK6iD_QvAviZmdwhbhZsGnz-xduBk7eviAG59nUhV0aPkZlHZqcEDV68cAHqvlUoWRWeoqlPubn"
        const fcmtoken = "fNZf0dggd4jE0JV692gaUE:APA91bG-cPwY6pku7Cw8mT5WDi3GvYFo3Vn-e2VQAkpWbDkgDNqtDIYqJ9_x1w0Pgh7N3oeQEEkFGilbiN2_QjSxAbOcWkqr86ZXVim_VL0-em9A0vLX3ouM-lDLAuE2GG4RPNwlJQcx"
        sendNotification(fcmtoken,"Testing", "hello all","https://friends-ledger.vercel.app")
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:"something went wrong!!.."})
    }
})


module.exports = router;