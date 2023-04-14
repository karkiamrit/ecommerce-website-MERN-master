const nodeMailer =require("nodemailer");

const sendEmail=async(options)=>{
    const transporter =nodeMailer.createTransport({
        //host:"smtp.gmail.com",
        //port:465     //yedi nachaleko case ma //+ google account ma gara less secure app access in on garne  
        service:process.env.SMTP_SERVICE,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD,
        }
    });
    const mailOptions={
        from:process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    };
    await transporter.sendMail(mailOptions);
};

module.exports =sendEmail;