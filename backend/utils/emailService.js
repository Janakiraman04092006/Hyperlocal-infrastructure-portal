const nodemailer = require('nodemailer');

// ==========================================
// BREVO SMTP TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',

  port: Number(process.env.EMAIL_PORT) || 587,

  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// ==========================================
// VERIFY EMAIL CONFIGURATION
// ==========================================

const verifyEmailConnection = async () => {
  try {
    console.log('');
    console.log('==========================================');
    console.log('BREVO SMTP EMAIL SERVICE');
    console.log('==========================================');

    console.log(
      'SMTP Host:',
      process.env.EMAIL_HOST || 'smtp-relay.brevo.com'
    );

    console.log(
      'SMTP Port:',
      process.env.EMAIL_PORT || '587'
    );

    console.log(
      'SMTP User:',
      process.env.EMAIL_USER ? 'LOADED' : 'MISSING'
    );

    console.log(
      'SMTP Password:',
      process.env.EMAIL_PASSWORD ? 'LOADED' : 'MISSING'
    );

    console.log(
      'Email From:',
      process.env.EMAIL_FROM || 'MISSING'
    );

    if (!process.env.EMAIL_USER) {
      throw new Error('EMAIL_USER is missing in .env');
    }

    if (!process.env.EMAIL_PASSWORD) {
      throw new Error('EMAIL_PASSWORD is missing in .env');
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is missing in .env');
    }

    await transporter.verify();

    console.log('');
    console.log('Email service connected successfully.');
    console.log('Brevo SMTP is ready.');
    console.log('==========================================');
    console.log('');

    return true;

  } catch (error) {

    console.error('');
    console.error('==========================================');
    console.error('EMAIL SERVICE ERROR');
    console.error('==========================================');
    console.error(
      'Email service connection failed:',
      error.message
    );
    console.error('==========================================');
    console.error('');

    return false;
  }
};

// ==========================================
// SEND OFFICER VERIFICATION OTP
// ==========================================

const sendOfficerOTP = async ({
  name,
  email,
  otp,
}) => {

  if (!name || !email || !otp) {
    throw new Error(
      'Name, email and OTP are required.'
    );
  }

  try {

    const mailOptions = {

      from:
        `"Hyperlocal Public Infrastructure Portal" <${process.env.EMAIL_FROM}>`,

      to: email,

      subject:
        'Officer Account Verification OTP',

      text: `
Hello ${name},

Your Officer account has been created by the administrator.

Your verification OTP is:

${otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

If you did not expect this account, please contact the administrator.

Regards,
Hyperlocal Public Infrastructure Portal
`,

      html: `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width,
               initial-scale=1.0">

<title>Officer Verification</title>

</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f6f8;
  font-family:Arial,
               Helvetica,
               sans-serif;
">

<div style="
  max-width:600px;
  margin:40px auto;
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 15px rgba(0,0,0,0.08);
">

  <!-- HEADER -->

  <div style="
    background:#1e3a8a;
    color:#ffffff;
    padding:25px;
    text-align:center;
  ">

    <h1 style="
      margin:0;
      font-size:24px;
    ">
      Hyperlocal Public
      Infrastructure Portal
    </h1>

    <p style="
      margin:8px 0 0;
      font-size:14px;
      opacity:0.9;
    ">
      Officer Account Verification
    </p>

  </div>


  <!-- CONTENT -->

  <div style="
    padding:35px;
  ">

    <p style="
      font-size:16px;
      color:#333333;
    ">
      Hello
      <strong>${name}</strong>,
    </p>

    <p style="
      font-size:15px;
      line-height:1.6;
      color:#555555;
    ">
      Your Officer account has been created
      by the system administrator.
    </p>

    <p style="
      font-size:15px;
      line-height:1.6;
      color:#555555;
    ">
      Please use the following OTP to verify
      your account:
    </p>


    <!-- OTP -->

    <div style="
      text-align:center;
      margin:30px 0;
    ">

      <div style="
        display:inline-block;
        background:#f1f5f9;
        border:2px solid #1e3a8a;
        border-radius:10px;
        padding:18px 35px;
      ">

        <span style="
          font-size:34px;
          font-weight:bold;
          letter-spacing:10px;
          color:#1e3a8a;
        ">
          ${otp}
        </span>

      </div>

    </div>


    <!-- EXPIRY -->

    <div style="
      background:#fff7ed;
      border-left:4px solid #f97316;
      padding:15px;
      margin:20px 0;
    ">

      <p style="
        margin:0;
        color:#7c2d12;
        font-size:14px;
      ">

        <strong>Important:</strong>

        This OTP will expire in
        <strong>5 minutes</strong>.

      </p>

    </div>


    <p style="
      font-size:14px;
      line-height:1.6;
      color:#666666;
    ">
      Please do not share this OTP with anyone.
    </p>

    <p style="
      font-size:14px;
      line-height:1.6;
      color:#666666;
    ">
      If you did not expect this account,
      please contact the administrator.
    </p>


    <hr style="
      border:none;
      border-top:1px solid #eeeeee;
      margin:30px 0;
    ">


    <p style="
      font-size:12px;
      color:#999999;
      text-align:center;
      margin:0;
    ">
      This is an automated message.
      Please do not reply to this email.
    </p>

  </div>


  <!-- FOOTER -->

  <div style="
    background:#f8fafc;
    padding:20px;
    text-align:center;
  ">

    <p style="
      margin:0;
      font-size:12px;
      color:#777777;
    ">
      Hyperlocal Public Infrastructure Portal
    </p>

  </div>

</div>

</body>

</html>
`,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      `Officer verification OTP sent successfully to ${email}`
    );

    console.log(
      'Message ID:',
      info.messageId
    );

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {

    console.error(
      'Officer OTP email error:',
      error.message
    );

    throw error;
  }
};

// ==========================================
// SEND OFFICER LOGIN OTP
// ==========================================

const sendLoginOTP = async ({
  name,
  email,
  otp,
}) => {

  if (!name || !email || !otp) {
    throw new Error(
      'Name, email and OTP are required.'
    );
  }

  try {

    const mailOptions = {

      from:
        `"Hyperlocal Public Infrastructure Portal" <${process.env.EMAIL_FROM}>`,

      to: email,

      subject:
        'Officer Login Verification OTP',

      text: `
Hello ${name},

A login attempt was made for your Officer account.

Your login verification OTP is:

${otp}

This OTP is valid for 5 minutes.

If you did not initiate this login, please contact the administrator immediately.

Regards,
Hyperlocal Public Infrastructure Portal
`,

      html: `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width,
               initial-scale=1.0">

<title>Login Verification</title>

</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f6f8;
  font-family:Arial,
               Helvetica,
               sans-serif;
">

<div style="
  max-width:600px;
  margin:40px auto;
  background:#ffffff;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 15px rgba(0,0,0,0.08);
">

  <!-- HEADER -->

  <div style="
    background:#1e3a8a;
    color:white;
    padding:25px;
    text-align:center;
  ">

    <h1 style="
      margin:0;
      font-size:24px;
    ">
      Officer Login Verification
    </h1>

    <p style="
      margin:8px 0 0;
      font-size:14px;
      opacity:0.9;
    ">
      Hyperlocal Public Infrastructure Portal
    </p>

  </div>


  <!-- CONTENT -->

  <div style="
    padding:35px;
  ">

    <p style="
      font-size:16px;
      color:#333333;
    ">
      Hello
      <strong>${name}</strong>,
    </p>

    <p style="
      font-size:15px;
      line-height:1.6;
      color:#555555;
    ">
      A login attempt was made for your
      Officer account.
    </p>

    <p style="
      font-size:15px;
      line-height:1.6;
      color:#555555;
    ">
      Enter the following OTP to complete
      your login:
    </p>


    <!-- OTP -->

    <div style="
      text-align:center;
      margin:30px 0;
    ">

      <div style="
        display:inline-block;
        background:#f1f5f9;
        border:2px solid #1e3a8a;
        border-radius:10px;
        padding:18px 35px;
      ">

        <span style="
          font-size:34px;
          font-weight:bold;
          letter-spacing:10px;
          color:#1e3a8a;
        ">
          ${otp}
        </span>

      </div>

    </div>


    <!-- EXPIRY -->

    <div style="
      background:#fff7ed;
      border-left:4px solid #f97316;
      padding:15px;
      margin:20px 0;
    ">

      <p style="
        margin:0;
        color:#7c2d12;
        font-size:14px;
      ">

        <strong>Important:</strong>

        This OTP will expire in
        <strong>5 minutes</strong>.

      </p>

    </div>


    <p style="
      font-size:14px;
      line-height:1.6;
      color:#666666;
    ">
      If you did not initiate this login,
      contact the administrator immediately.
    </p>


    <hr style="
      border:none;
      border-top:1px solid #eeeeee;
      margin:30px 0;
    ">


    <p style="
      font-size:12px;
      color:#999999;
      text-align:center;
      margin:0;
    ">
      This is an automated security message.
    </p>

  </div>


  <!-- FOOTER -->

  <div style="
    background:#f8fafc;
    padding:20px;
    text-align:center;
  ">

    <p style="
      margin:0;
      font-size:12px;
      color:#777777;
    ">
      Hyperlocal Public Infrastructure Portal
    </p>

  </div>

</div>

</body>

</html>
`,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      `Officer login OTP sent successfully to ${email}`
    );

    console.log(
      'Message ID:',
      info.messageId
    );

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {

    console.error(
      'Login OTP email error:',
      error.message
    );

    throw error;
  }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  transporter,
  verifyEmailConnection,
  sendOfficerOTP,
  sendLoginOTP,
};