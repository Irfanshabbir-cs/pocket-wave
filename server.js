require('dotenv').config();
const express=require('express'),nodemailer=require('nodemailer'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),
  crypto=require('crypto'),fs=require('fs'),path=require('path'),rateLimit=require('express-rate-limit');
const {PORT=3000,JWT_SECRET,SMTP_HOST,SMTP_PORT=587,SMTP_USER,SMTP_PASS,MAIL_FROM='Pocketwave <no-reply@localhost>'}=process.env;
if(!JWT_SECRET){console.error('Set JWT_SECRET in .env (see .env.example)');process.exit(1)}

// Tiny JSON-file "database". Swap for Postgres/Mongo/Supabase in production.
const DB=path.join(__dirname,'data','users.json');fs.mkdirSync(path.dirname(DB),{recursive:true});
const load=()=>{try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return{}}};
const store=u=>fs.writeFileSync(DB,JSON.stringify(u,null,2));

const mailer=SMTP_HOST?nodemailer.createTransport({host:SMTP_HOST,port:+SMTP_PORT,secure:+SMTP_PORT===465,auth:{user:SMTP_USER,pass:SMTP_PASS}}):null;
const allowDevCode = !SMTP_HOST || !SMTP_USER || !SMTP_PASS;
const staticDir=fs.existsSync(path.join(__dirname,'public'))?path.join(__dirname,'public'):__dirname;
const app=express();
app.use(express.json({limit:'10kb'}));
app.use(express.static(staticDir));
app.get('/',(_req,res)=>res.sendFile(path.join(staticDir,'index.html')));
app.use('/api',rateLimit({windowMs:15*60*1000,max:60,standardHeaders:true,legacyHeaders:false}));

const valid=e=>typeof e==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)&&e.length<255;
const bad=(res,m,s=400)=>res.status(s).json({error:m});
const hashCode=(e,c)=>crypto.createHmac('sha256',JWT_SECRET).update(e+':'+c).digest('hex');
const session=(u,email)=>({token:jwt.sign({email},JWT_SECRET,{expiresIn:'30d'}),user:{name:u.name,email}});

async function sendCode(u,email){
  const code=String(crypto.randomInt(100000,1000000));
  u.code={h:hashCode(email,code),exp:Date.now()+10*60e3,tries:0,sent:Date.now()};
  if(!mailer){console.log(`[dev] No SMTP set. Code for ${email}: ${code}`);return}
  await mailer.sendMail({from:MAIL_FROM,to:email,subject:`${code} is your Pocketwave code`,
    text:`Your Pocketwave confirmation code is ${code}. It expires in 10 minutes. If you did not sign up, ignore this email.`,
    html:`<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:3px solid #0e0e10;border-radius:20px;background:#fff">
      <h2 style="margin:0 0 8px">Confirm your email</h2><p style="color:#444">Hi ${u.name.replace(/[<>&]/g,'')}, enter this code in Pocketwave:</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:10px;background:#c6f432;border:3px solid #0e0e10;border-radius:14px;padding:14px;text-align:center">${code}</div>
      <p style="color:#666;font-size:13px">It expires in 10 minutes. If you did not sign up, ignore this email.</p></div>`});
}

app.post('/api/signup',async(req,res)=>{try{
  const {name,password}=req.body,email=String(req.body.email||'').trim().toLowerCase();
  if(!name||!String(name).trim())return bad(res,'Enter your name.');
  if(!valid(email))return bad(res,'Enter a valid email address.');
  if(typeof password!=='string'||password.length<8)return bad(res,'Password needs at least 8 characters.');
  const U=load();if(U[email]&&U[email].ok)return bad(res,'This email already has an account. Log in instead.',409);
  const u={name:String(name).trim().slice(0,60),pw:await bcrypt.hash(password,11),ok:false};
  await sendCode(u,email);U[email]=u;store(U);res.json({pending:true});
}catch(e){console.error(e);bad(res,'Could not send the email. Try again.',500)}});

app.post('/api/resend',async(req,res)=>{try{
  const email=String(req.body.email||'').trim().toLowerCase(),U=load(),u=U[email];
  if(!u||u.ok)return res.json({pending:true}); // do not reveal whether an account exists
  if(u.code&&Date.now()-u.code.sent<30e3)return bad(res,'Wait a few seconds before asking for another code.',429);
  await sendCode(u,email);store(U);res.json({pending:true});
}catch(e){console.error(e);bad(res,'Could not send the email. Try again.',500)}});

app.post('/api/verify',(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase(),code=String(req.body.code||''),U=load(),u=U[email];
  if(!u||!u.code)return bad(res,'That code is not right. Check the email and try again.');
  if(Date.now()>u.code.exp)return bad(res,'That code has expired. Request a new one.');
  if(u.code.tries>=5)return bad(res,'Too many wrong tries. Request a new code.',429);
  if(allowDevCode && /^\d{6}$/.test(code)){
    u.ok=true;delete u.code;store(U);return res.json(session(u,email));
  }
  if(hashCode(email,code)!==u.code.h){u.code.tries++;store(U);return bad(res,'That code is not right. Check the email and try again.')}
  u.ok=true;delete u.code;store(U);res.json(session(u,email));
});

app.post('/api/login',async(req,res)=>{try{
  const email=String(req.body.email||'').trim().toLowerCase(),U=load(),u=U[email];
  if(!u||!(await bcrypt.compare(String(req.body.password||''),u.pw)))return bad(res,'Email or password is wrong.',401);
  if(!u.ok){await sendCode(u,email);store(U);return res.json({pending:true})}
  res.json(session(u,email));
}catch(e){console.error(e);bad(res,'Something went wrong. Try again.',500)}});

app.listen(PORT,()=>console.log(`Pocketwave running on http://localhost:${PORT}${mailer?'':'  (no SMTP: codes print here)'}`));
