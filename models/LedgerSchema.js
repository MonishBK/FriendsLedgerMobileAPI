const mongoose = require("mongoose");


// Friends Ledger Schema
const friendsLedger = mongoose.Schema({
    UID:{
        type: String,
        required: true,
        trim:true
    },
    UName:{
        type: String,
        trim:true
    },
    SUID:{
        type: String,
        trim:true
    },
    title:{
        type: String,
        required: true,
        trim:true
    },
    desc:{
        type:String,
        // required: true,
        trim: true
    },
    person_name:{
        type: String,
        required: true,
        trim:true
    },
    share:{
        type: Boolean,
        required: true,
        trim: true
    },
    status:{
        type: Boolean,
        required: true,
        trim: true
    },
    reg_num:{
        type: Number,
        trim:true,
    },
    amount:{
        type: Number,
        required: true
    },
    balanceAmount:{
        type: Number,
        required: true
    },
    transactionType:{
        type: String,
        required: true
    },
    mode:{
        type: String,
        required: true
    },
    transactionDate:{
        type: String,
        required: true
    },
    transactionData:{
        type: Array,
        required: true
    },
    theme:{
        type: String,
        required: true
    },
    CreatedOn: {
        type: String,
        default: new Date().toLocaleString(),
      }
},{
    timestamps: { currentTime: ()=> Date.now() },  
})

// Shopping Ledger Schema
const shoppingLedger = mongoose.Schema({
    UID:{
        type: String,
        required: true,
        trim:true
    },
    title:{
        type: String,
        required: true,
        trim:true
    },
    desc:{
        type:String,
        // required: true,
        trim: true
    },
    fixed:{
        type: Boolean,
        trim:true
    },
    status:{
        type: Boolean,
        required: true,
        trim: true
    },
    amount:{
        type: Number,
        // required: true
    },
    totalAmount:{
        type: Number,
        // required: true
    },
    balanceAmount:{
        type: Number,
        // required: true
    },
    transactionData:{
        type: Array,
        required: true
    },
    theme:{
        type: String,
        required: true
    },
    CreatedOn: {
        type: String,
        default: new Date().toLocaleString(),
      }
},{
    timestamps: { currentTime: ()=> Date.now() },  
})

// Bill Tracker Schema
const billTracker = mongoose.Schema({
    UID:{
        type: String,
        required: true,
        trim:true
    },
    title:{
        type: String,
        required: true,
        trim:true
    },
    desc:{
        type:String,
        // required: true,
        trim: true
    },
    fixed:{
        type: Boolean,
        trim:true
    },
    status:{
        type: Boolean,
        required: true,
        trim: true
    },
    amount:{
        type: Number,
        // required: true
    },
    totalAmount:{
        type: Number,
        // required: true
    },
    balanceAmount:{
        type: Number,
        // required: true
    },
    transactionData:{
        type: Array,
        required: true
    },
    theme:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    billDate:{
        type: String,
        required: true
    },
    CreatedOn: {
        type: String,
        default: new Date().toLocaleString(),
      }
      
},{
    timestamps: { currentTime: ()=> Date.now() },  
})

// Sticky Notes Schema
const stickyNotesSchema = mongoose.Schema({
    UID:{
        type: String,
        required: true,
        trim:true
    },
    title:{
        type: String,
        required: true,
        trim:true
    },
    desc:{
        type:String,
        // required: true,
        trim: true
    },
    theme:{
        type: String,
        required: true
    },
    CreatedOn: {
        type: String,
        default: new Date().toLocaleString(), 
    },
},{
    timestamps: { currentTime: ()=> Date.now() },  
}
)

const FriendsLedger = mongoose.model("FRIENDSLEDGER", friendsLedger);
const ShoppingLedger = mongoose.model("SHOPPINGLEDGER", shoppingLedger);
const BillTracker = mongoose.model("BILLTRACKER", billTracker);
const StickyNotes = mongoose.model("STICKYNOTES", stickyNotesSchema);

// exporting modules
module.exports = {FriendsLedger, ShoppingLedger, BillTracker, StickyNotes};