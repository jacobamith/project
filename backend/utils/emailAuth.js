const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    service:"google",
    port:587,
    secure:false,
    auth:{
        user:'https://collaboration-tool-aajt.onrender.com',
        pass:'tgfs cczv czso mygd'
    }
});
const sendmail= async(email,text)=>{
    const mailOptions = {
        from:'"collaboration" <collaboration@gmail.com>',
        to:email,
        subject:"Verify Email",
        text:text,
    }

    await transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
           
            
        }
        
        
    });
}

module.exports=sendmail