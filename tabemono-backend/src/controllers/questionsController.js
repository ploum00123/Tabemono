const db = require('../config/database');

exports.getInitialCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM food_categories');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching initial categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFoodOptions = async (req, res) => {
  const { categoryId, type1, type2, type3 } = req.query;
  try {
    let query = 'SELECT DISTINCT ';
    let params = [categoryId];
    let selectColumn = 'type1';

    if (type1) {
      selectColumn = 'type2';
      params.push(type1);
    }
    if (type2) {
      selectColumn = 'type3';
      params.push(type2);
    }
    if (type3) {
      selectColumn = 'type4';
      params.push(type3);
    }

    query += `${selectColumn} FROM food_items WHERE category_id = ?`;

    for (let i = 1; i < params.length; i++) {
      query += ` AND type${i} = ?`;
    }

    query += ` AND ${selectColumn} IS NOT NULL`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const [options] = await db.query(query, params);
    
    console.log('Query results:', options);

    res.json(options);
  } catch (error) {
    console.error('Error fetching food options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.saveFoodSelection = async (req, res) => {
  const { userId, categoryId, type1, type2, type3, type4 } = req.body;
  try {
    await db.query(
      'INSERT INTO food_selections (user_id, category_id, type1, type2, type3, type4) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, categoryId, type1, type2, type3, type4]
    );
    res.status(201).json({ message: 'Food selection saved successfully' });
  } catch (error) {
    console.error('Error saving food selection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};