const db = require('../config/database');

exports.createUser = async (req, res) => {
  try {
    const { id, gender, age } = req.body;
    
    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (existingUser.length > 0) {
      await db.query('UPDATE users SET gender = ?, age = ? WHERE id = ?', [gender, age, id]);
      res.status(200).json({ message: 'User updated successfully', id, gender, age });
    } else {
      await db.query('INSERT INTO users (id, gender, age) VALUES (?, ?, ?)', [id, gender, age]);
      res.status(201).json({ message: 'User created successfully', id, gender, age });
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ error: 'Error creating/updating user' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

exports.recordUserLogin = async (req, res) => {
  const { userId } = req.body;
  try {
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = ?',
      [userId]
    );
    res.status(200).json({ message: 'User login recorded' });
  } catch (error) {
    console.error('Error recording user login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};