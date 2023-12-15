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
  userType: { type: String, required: true },
  fav: { type: Array }
});
const User = mongoose.model('User', UserSchema);

//Create a default admin account
User.findOne({ userType: "admin" })
  .then((data) => {
    if (!data) {
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
  .then((data) => {
    if (!data) {
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
    return res.json({ exist: `Username ${username} already exists` });

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

  if (user.userType === 'admin') {
    this.login = 2;
    return res.json({ admin: "Login as admin." });
  }
  else if (user.userType === 'user') {
    this.login = 1;
    return res.json({ user: "Login as user." });
  }
}

//CRUD stored users
//C
module.exports.CreateUser = async function (req, res) {
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  let CMess = "";
  User.findOne({ username: username })
    .then((data) => {
      if (data) {
        CMess += ('User is already created before');
        res.contentType('text/plain');
        res.status(404).send(CMess);
      }
      else {
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

        CMess += ('A new user account is created');
        res.contentType('text/plain');
        res.status(200).send(CMess);

      }
    })

}


//R
module.exports.ReadUser = async function (req, res) {
  const username = req.params.username;
  let RMess = "";
  User.findOne({ username: username })
    .then((data) => {
      if (!data) {
        RMess += ('User is not created before');
        res.contentType('text/plain');
        res.status(404).send(RMess);
      }
      else {
        RMess += ("{\n\"username\":" + data.username +
          ",\n\"(Hashed) password\":" + data.password +
          ",\n\"userType\":" + data.userType +
          "\n}\n");
        res.contentType('text/plain')
        res.status(200).send(RMess);

      }
    })
}


//U
module.exports.UpdateUser = async function (req, res) {
  let username = req.params.username;
  let newusername = req.body.newusername;
  let newpassword = bcrypt.hashSync(req.body.newpassword, bcrypt.genSaltSync(10));
  let UMess = "";
  User.findOne({ username: username })
    .then((data) => {
      if (!data) {
        UMess += ('User is not created before');
        res.contentType('text/plain');
        res.status(404).send(UMess);
      }
      else {
        if (newusername === "") newusername = data.username;
        if (newpassword === "") newpassword = data.password;
        User.findOneAndUpdate(
            { username: { $eq: username } },
            { username: newusername, password: newpassword },
            { new: true })
        .then((dataU) =>{  
        UMess += ('You have successfully update an user account');
        res.contentType('text/plain');
        res.status(200).send(UMess);
        })
      }
    })


}


//D
module.exports.DeleteUser = async function (req, res) {
  const username = req.params.username;
  User.findOne({ username: { $eq: username } })
    .then((data) => {
      if (!data) {
        res.contentType('text/plain');
        res.send("no such data");
      }

      else {
        User.findOneAndDelete(
          { username: { $eq: username } },
        )
          .then((dataU) => {
            res.contentType('text/plain');
            res.send('The user account is deleted successfully');
          })
          .catch((error) => console.log(error));

      }

    })
};

module.exports.addfav = async function (req, res) {
  let response = { exist: 0 };
  //console.log(req.body);
  User.findOne({ username: req.body.username })
    .then(async (data) => {
      if (data) {
        data.fav.forEach(element => {
          if (element === req.body.venueId) response = { exist: 1 }
        });
        if (!response.exist) {
          const temp = data.fav;
          temp.push(req.body.venueId);
          await User.findOneAndUpdate( //update the number of events at venue
            { username: req.body.username },
            {
              fav: temp
            },
            { new: true },
          );
          response = { exist: 0 };
        }
      }
      res.setHeader('Content-Type', 'text/json');
      res.send(response);
    })
    .catch((error) => console.log(error));
}
module.exports.user = async function (req, res) {
  return new Promise((resolve, reject) => {
    User.findOne({ username: req.body.name })
      .then((data) => {
        if (data) {
          // Resolve with the fav array if data is found
          resolve(data.fav);
        } else {
          // Reject with an error if data is not found
          reject('User not found');
        }
      })
      .catch((error) => {
        // Reject with the error if any error occurs
        reject(error);
      });
  });
}
