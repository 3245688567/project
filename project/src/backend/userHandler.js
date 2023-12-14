const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
app.use(cors());
app.use(express.json());

const UserSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true }
  });
const User = mongoose.model('User', UserSchema);

//Create a default admin account
User.findOne({ userType: "admin" })
.then((data)=>{
    if(!data)
    {
        let Admin = new User({
            username: "admin",
            password: bcrypt.hashSync("admin", bcrypt.genSaltSync(10)),
            userType: "admin"
            });
        
            //Saving this to database
            Admin
            .save()
            .then(() => {
              console.log("admin account is created");
            })
            .catch((error) => {
              console.log("fail to create the admin account");
              console.log(error);
            });
    }
})

User.findOne({ username: "abc123" })
.then((data)=>{
    if(!data)
    {
        let user1 = new User({
            username: "abc123",
            password: bcrypt.hashSync("abc123", bcrypt.genSaltSync(10)),
            userType: "user"
            });
        
            //Saving this to database
            user1
            .save()
            .then(() => {
              console.log("user--abc123 account is created");
            })
            .catch((error) => {
              console.log("fail to create the user--abc123 account");
              console.log(error);
            });
    }
})

module.exports.register = async function (req, res) {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username })

    if (user)
        return res.json({ exist : `Username ${username} already exists` });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    var newUser = new User();
    newUser.username = username;
    newUser.password = hashedPassword;
    newUser.userType = 'user'
    await newUser.save();

    return res.json({ message: `Registration successful ${username} created.` })


}

module.exports.login = async function (req, res) {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username })

    if (!user)
        return res.json({ error: "User not found or password is incorrect." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.json({ error: "User not found or password is incorrect." });

    if(user.userType === 'admin'){
        this.login = 2;
        return res.json({ admin: "Login as admin." });
    }
    else if(user.userType === 'user'){
        this.login = 1;
        return res.json({ user: "Login as user." });
    }
}

//CRUD stored users
//C
app.post('/user/', (req, res) => {
    const username = req.body.username;
    const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    let CMess = "";
    User.findOne({ username: username })
    .then((data)=>{
      if(data){
        CMess += ('User is already created before<br></br><br></br><a href="/content">return to "Content"</a>');
        res.contentType('text/plain');
        res.status(404).send(CMess);
      }
      else{
        let newUser = new User({
          username: username,
          password: password,
          userType: "user"
          });
      
          //Saving this to database
          newUser
          .save()
          .then(() => {
            console.log("a new user account is created");
          })
          .catch((error) => {
            console.log("fail to create the user account");
            console.log(error);
          });
  
        CMess += ('A new user account is created<br></br><br></br><a href="/content">return to "Content"</a>');
        res.contentType('text/plain');
        res.status(200).send(CMess);
  
      }
    })
  
  
  })
  
  
  //R
  app.get('/user/:username',  (req, res) => {
    const username = req.params.username;
    let RMess = "";
    User.findOne({ username: username })
    .then((data)=>{
      if(!data){
        RMess += ('User is not created before<br></br><br></br><a href="/content">return to "Content"</a>');
        res.contentType('text/plain');
        res.status(404).send(RMess);
      }
      else{
        RMess += ("{<br></br>\"username\":"+ data[0].username +
        ",<br></br>\"(Hashed) password\":"+ data[0].password + 
        ",<br></br>\"userType\":"+ data[0].userType +
        "<br></br>}<br></br>"+
        "<br></br><a href='/content'>return to 'Content'</a>");
        res.contentType('text/plain')
        res.status(200).send(RMess);
  
      }
    })
  })
  
  
  //U
  app.put('/user/:username', (req, res) => {
    const username = req.params.username;
    const newusername = req.body.newusername;
    const newpassword = bcrypt.hashSync(req.body.newpassword, bcrypt.genSaltSync(10));
    let UMess = "";
    User.findOne({ username: username })
    .then((data)=>{
      if(!data){
        UMess += ('User is not created before<br></br><br></br><a href="/content">return to "Content"</a>');
        res.contentType('text/plain');
        res.status(404).send(UMess);
      }
      else{
        if(newusername !== "")
          User.findOneAndUpdate(
            {username:{ $eq: username }},
            {username: newusername},
            {new: true})
        if(newpassword !== "")
          User.findOneAndUpdate(
            {username:{ $eq: username }},
            {password: newpassword},
            {new: true})
        UMess += ('You have successfully update an user.<br></br><br></br><a href="/content">return to "Content"</a>');
        res.contentType('text/plain');
        res.status(200).send(UMess);
  
      }
    })
  
  
  })
  
  
  //D
  app.delete('/user/:username', (req, res) => {
    const username = req.params.username;
    Event.find({username: {$eq: username}})
    .then((data) => {
      if (data === ""){
        res.contentType('text/plain');
        res.status(404).send("no such data");
      }
    
      else {
        Event.findOneAndDelete(
          { username: {$eq: username} }, 
          )
          .then((data) => {
            res.contentType('text/plain');
            res.status(204).send('The deleted data is:', data);
          })
          .catch((error) => console.log(error));
          
      }
  
  })
  })
