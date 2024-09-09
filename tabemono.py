import pandas as pd
import mysql.connector

# ข้อมูลการเชื่อมต่อ MySQL
conn = mysql.connector.connect(
    host='9gbovi.stackhero-network.com',
    user='root',
    password='hnS2a6ElU4OMaltJXyMZ2XKQ7pq2scG4',
    database='tabemono'
)

cursor = conn.cursor()

# สร้างฐานข้อมูลถ้ายังไม่มี
cursor.execute("CREATE DATABASE IF NOT EXISTS tabemono")
cursor.execute("USE tabemono")

# สร้างตาราง users
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        gender ENUM('ชาย','หญิง') NOT NULL,
        age INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                                                                                                                            
        favorite_food VARCHAR(255),
        dietary_restrictions TEXT,
        last_login TIMESTAMP NULL DEFAULT NULL,
        login_count INT DEFAULT 0
    ) ENGINE=InnoDB;
''')

# สร้างตารางสำหรับการเก็บข้อมูลจาก Excel
cursor.execute('''
    CREATE TABLE IF NOT EXISTS food_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB;
''')

# สร้างตาราง food_selections
cursor.execute('''
    CREATE TABLE IF NOT EXISTS food_selections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255),
        food_category_id INT,
        favorite_type VARCHAR(255) NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comments TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (food_category_id) REFERENCES food_categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
''')

# สร้างตาราง food_items
cursor.execute('''
    CREATE TABLE IF NOT EXISTS food_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        namefood VARCHAR(255),
        type1 VARCHAR(255),
        type2 VARCHAR(255),
        type3 VARCHAR(255),
        type4 VARCHAR(255),
        image_url TEXT,
        FOREIGN KEY (category_id) REFERENCES food_categories(id)
    ) ENGINE=InnoDB;
''')

# สร้างตาราง user_selections เพื่อเก็บประวัติการเลือกของผู้ใช้
cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_selections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        type1 VARCHAR(255),
        type2 VARCHAR(255),
        type3 VARCHAR(255),
        type4 VARCHAR(255),
        selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES food_categories(id)
    ) ENGINE=InnoDB;
''')

# สร้างตาราง food_views เพื่อเก็บจำนวนการดูอาหารแต่ละรายการ
cursor.execute('''
    CREATE TABLE IF NOT EXISTS food_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        food_item_id INT NOT NULL,
        view_count INT DEFAULT 0,
        last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    ) ENGINE=InnoDB;
''')

# เพิ่มข้อมูลหมวดหมู่ (food_categories)
categories = ['อาหารทำสด', 'ของเวฟ', 'ของหวาน', 'เครื่องดื่ม']

for category in categories:
    cursor.execute("SELECT COUNT(*) FROM food_categories WHERE category_name = %s", (category,))
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO food_categories (category_name) VALUES (%s)", (category,))
        conn.commit()

def insert_food_items(df, category_name):
    cursor.execute("SELECT id FROM food_categories WHERE category_name = %s", (category_name,))
    category_id = cursor.fetchone()[0]

    # เคลียร์ผลลัพธ์ที่ค้างอยู่ใน cursor
    cursor.fetchall()

    # แบ่งข้อมูลเป็นกลุ่มละ 25 แถว
    for i in range(0, len(df), 25):
        batch_df = df.iloc[i:i + 25]
        for _, row in batch_df.iterrows():
            namefood = row.get('namefood') if pd.notna(row.get('namefood')) else None
            type1 = row.get('type1') if pd.notna(row.get('type1')) else None
            type2 = row.get('type2') if pd.notna(row.get('type2')) else None
            type3 = row.get('type3') if pd.notna(row.get('type3')) else None
            type4 = row.get('type4') if pd.notna(row.get('type4')) else None
            image_url = row.get('image_url') if pd.notna(row.get('image_url')) else None

            cursor.execute('''
                INSERT INTO food_items (category_id, namefood, type1, type2, type3, type4, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (category_id, namefood, type1, type2, type3, type4, image_url))

            print(f"Added: category_id={category_id}, namefood={namefood}, type1={type1}, type2={type2}, type3={type3}, type4={type4}, image_url={image_url}")
        
        # Commit หลังจากส่งข้อมูลแต่ละกลุ่ม
        conn.commit()

# อ่านข้อมูลจากไฟล์ Excel
df_fresh_food = pd.read_excel(r'D:\database-excel\อาหารทำสด.xlsx')
df_microwave_food = pd.read_excel(r'D:\database-excel\ของเวฟ.xlsx')
df_dessert = pd.read_excel(r'D:\database-excel\ขนมหวานโดเรมี่.xlsx')
df_drink = pd.read_excel(r'D:\database-excel\เครื่องดื่ม.xlsx')

# เพิ่มข้อมูลจาก Excel
insert_food_items(df_fresh_food, 'อาหารทำสด')
insert_food_items(df_microwave_food, 'ของเวฟ')
insert_food_items(df_dessert, 'ของหวาน')
insert_food_items(df_drink, 'เครื่องดื่ม')

# ปิดการเชื่อมต่อกับฐานข้อมูล
cursor.close()
conn.close()
