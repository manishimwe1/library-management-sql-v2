import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

export const signUp = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const checkUserQuery = `SELECT id FROM users WHERE email = ?`;
  db.get(checkUserQuery, [email], (err, row) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (row) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    db.run(insertQuery, [username, email, hashedPassword], function (err) {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Error creating user' });
      }

      const token = generateToken({
        id: this.lastID,
        email,
        username
      });

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { id: this.lastID, email, username }
      });
    });
  });
};

export const signIn = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ message: 'Error finding user' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  });
};

export const getAllUsers = (req, res) => {
  const query = `SELECT id, username, email FROM users`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error getting users:', err);
      return res.status(500).json({ message: 'Error getting users' });
    }
    res.status(200).json(rows);
  });
};
