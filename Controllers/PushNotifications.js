var FCM = require('fcm-node');
const nodemailer = require("nodemailer")
var serverKey = process.env.SERVER_KEY; //put your server key here
var fcm = new FCM(serverKey);

const sendNotification = (fcmToken, title, body, click_action ) =>{
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        // to: fcmToken, 
        registration_ids: fcmToken,
        // collapse_key: collapseValue,
        
        data: {
            title, 
            body,
            click_action
        },
        
        // data: {  //you can send only notification or only data(or include both)
        //     my_key: 'my value',
        //     my_another_key: 'my another value'
        // }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            // console.log("Something has gone wrong!", err);
        } else {
            // console.log("Successfully sent with response: ");
        }
    });
}

const sendEmail = (email, subject, html) =>{
   
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
})

  let details = {
      from: `Friends Ledger <${process.env.EMAIL_ID}>` ,
      to: email,
      subject,
      html
  }

  mailTransporter.sendMail(details, (err) =>{
      if(err){
        //   console.log("error=> ",err)
      }else{
        //   console.log("email has sent") 
      } 
  })
}

module.exports = {sendNotification, sendEmail}