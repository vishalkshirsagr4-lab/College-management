const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ 
    id: user._id ,
    role: user.role,
}, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const login = async (req, res) => {
  const { loginID , password } = req.body;

  if (!loginID || !password) {
    return res.status(400).json({ message: 'Login ID and password are required' });
  }

  const user = await User.findOne({ loginID });

  if (!user) {
    return res.status(401).json({ message: 'Invalid login ID or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid login ID or password' });
  }

  const token = generateToken(user);

  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

const getProfile = async (req, res) => {
    try {
  const user = await User.findById(req.user.id).select('-password');
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
   } 
   res.status(200).json({
    success: true,
    user
});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {
  login,
  getProfile,
};