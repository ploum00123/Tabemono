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
  const { categoryId, type1, type2, type3, type4 } = req.query;
  try {
    let query = 'SELECT DISTINCT ';
    let params = [categoryId];

    if (!type1) {
      query += 'type1 FROM food_items WHERE category_id = ?';
    } else if (!type2) {
      query += 'type2 FROM food_items WHERE category_id = ? AND type1 = ?';
      params.push(type1);
    } else if (!type3) {
      query += 'type3 FROM food_items WHERE category_id = ? AND type1 = ? AND type2 = ?';
      params.push(type1, type2);
    } else if (!type4) {
      query += 'type4 FROM food_items WHERE category_id = ? AND type1 = ? AND type2 = ? AND type3 = ?';
      params.push(type1, type2, type3);
    } else {
        query += '* FROM food_items WHERE category_id = ? AND type1 = ? AND type2 = ? AND type3 = ? AND type4 = ?';
        params.push(type1, type2, type3, type4);
    }

    const [options] = await db.query(query, params);
    res.json(options);
  } catch (error) {
    console.error('Error fetching food options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.saveFoodSelection = async (req, res) => {
  const { user_id, food_category_id, favorite_type, rating, comments } = req.body;
  try {
    await db.query(
      'INSERT INTO food_selections (user_id, food_category_id, favorite_type, rating, comments) VALUES (?, ?, ?, ?, ?)',
      [user_id, food_category_id, favorite_type, rating, comments]
    );
    res.status(201).json({ message: 'Food selection saved successfully' });
  } catch (error) {
    console.error('Error saving food selection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};