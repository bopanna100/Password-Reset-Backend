const mongodb = require("mongodb");
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
dotenv.config();
const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;
const nodemailer = require('nodemailer');

const forgotpassword = async (req, res) => {
    try {
       
        let client = await mongoClient.connect(MONGO_URL);
       
        let db = client.db("FPadmin");
       
        let user = await db.collection('users').findOne({ email: req.body.email });
      
        if (user) {
           
            let randomString = randomstring.generate();

           
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                   
                }
            });
            //Mail options
            let mailOptions = {
                from: 'no-reply@noreply.com',
                to: `${req.body.email}`,
                subject: 'Reset Password - BrandFP',
                html: `<h4>Hello,</h4><p>We've received a request to reset the password for the AdminFP account. You can reset the password by clicking the link below.</p><link>${process.env.FRONTEND_URL}/reset-password?tk=${randomString}</link>`
            }
            //Send mail
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('email sent successfully')
                }
            })
          
            const expiresin = new Date();
            expiresin.setHours(expiresin.getHours() + 1);
         
            await db.collection('users').findOneAndUpdate({ email: req.body.email }, { $set: { resetPasswordToken: randomString, resetPasswordExpires: expiresin } });
         
            await client.close();
            res.json({
                exists: true
            })
        }
        else {
            res.json({
                message: "User doesnot exist",
                exists: false
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

module.exports = forgotpassword