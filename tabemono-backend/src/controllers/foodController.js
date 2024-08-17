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

    if (!type1) {
      query += 'type1 FROM food_items WHERE category_id = ?';
    } else if (!type2) {
      query += 'type2 FROM food_items WHERE category_id = ? AND type1 = ?';
      params.push(type1);
    } else if (!type3) {
      query += 'type3 FROM food_items WHERE category_id = ? AND type1 = ? AND type2 = ?';
      params.push(type1, type2);
    } else {
      query += '* FROM food_items WHERE category_id = ? AND type1 = ? AND type2 = ? AND type3 = ?';
      params.push(type1, type2, type3);
    }

    const [options] = await db.query(query, params);
    res.json(options);
  } catch (error) {
    console.error('Error fetching food options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFilteredResults = async (req, res) => {
  try {
    const { categoryId, type1, type2, type3 } = req.query;
    
    let query = 'SELECT * FROM food_items WHERE 1=1';
    const params = [];

    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }
    if (type1) {
      query += ' AND type1 = ?';
      params.push(type1);
    }
    if (type2) {
      query += ' AND type2 = ?';
      params.push(type2);
    }
    if (type3) {
      query += ' AND type3 = ?';
      params.push(type3);
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error fetching filtered results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.recordFoodSelection = async (req, res) => {
  const { userId, categoryId, type1, type2, type3, type4 } = req.body;
  try {
    await db.query(
      'INSERT INTO user_selections (user_id, category_id, type1, type2, type3, type4) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, categoryId, type1, type2, type3, type4]
    );
    res.status(201).json({ message: 'Food selection recorded' });
  } catch (error) {
    console.error('Error recording food selection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.incrementFoodView = async (req, res) => {
  const { foodItemId } = req.body;
  try {
    await db.query(
      'INSERT INTO food_views (food_item_id, view_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE view_count = view_count + 1',
      [foodItemId]
    );
    res.status(200).json({ message: 'Food view incremented' });
  } catch (error) {
    console.error('Error incrementing food view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const [popularFoods] = await db.query(
      'SELECT fi.namefood, fv.view_count FROM food_views fv JOIN food_items fi ON fv.food_item_id = fi.id ORDER BY fv.view_count DESC LIMIT 10'
    );
    const [userSelectionStats] = await db.query(
      'SELECT fc.category_name, COUNT(*) as selection_count FROM user_selections us JOIN food_categories fc ON us.category_id = fc.id GROUP BY us.category_id ORDER BY selection_count DESC'
    );
    res.json({ popularFoods, userSelectionStats });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};