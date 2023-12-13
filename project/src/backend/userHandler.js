const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

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

    if(user.userType === 'admin')
        return res.json({ admin: "Login as admin." });
    else if(user.userType === 'user')
        return res.json({ user: "Login as user." });
}
