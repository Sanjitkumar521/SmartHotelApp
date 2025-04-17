from flask import Blueprint, jsonify,request
from database import get_db_connection

add_menu_bp = Blueprint('add_menu', __name__)
Fetch_menu_bp = Blueprint('Fetch_menu', __name__)
update__menu_bp = Blueprint('Update_menu', __name__)
delete_menu_bp = Blueprint('Delete_menu', __name__)
@add_menu_bp.route('/add_menu', methods=['POST'])
def add_menu():
    try:
        #data = request.json
        name = request.form.get('name')
        description = request.form.get('description')
        price = request.form.get('price')
        category = request.form.get('category')
        image_url = request.form.get('image_url')

        if not name or not price:
            return jsonify({'error': 'Name and price are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Menu (name, description, price, category, image_url)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, description, price, category, image_url))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Menu added successfully'}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Server error'}), 500
    
    
# Fetch menu item by ID
@Fetch_menu_bp.route('/get_menu/<int:menu_id>', methods=['GET'])
def get_menu(menu_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT menu_id, name, description, price, category, image_url 
            FROM Menu 
            WHERE menu_id = %s
        """, (menu_id,))
        menu = cursor.fetchone()
        conn.close()

        if menu:
            return jsonify(menu), 200
        return jsonify({'error': 'Menu item not found'}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Server error'}), 500

# Update menu item
@update__menu_bp.route('/update_menu/<int:menu_id>', methods=['PUT'])
def update_menu(menu_id):
    try:
        data = request.json
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        category = data.get('category')
        image_url = data.get('image_url')

        if not name or not price:
            return jsonify({'error': 'Name and price are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Menu 
            SET name = %s, description = %s, price = %s, category = %s, image_url = %s
            WHERE menu_id = %s
        """, (name, description, price, category, image_url, menu_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Menu item not found'}), 404

        conn.commit()
        conn.close()
        return jsonify({'message': 'Menu updated successfully'}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Server error'}), 500
    

@delete_menu_bp.route('/delete_menu/<int:menu_id>', methods=['DELETE'])
def delete_menu(menu_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Menu WHERE menu_id = %s", (menu_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Menu item not found'}), 404

        conn.commit()
        conn.close()
        return jsonify({'message': 'Menu item deleted successfully'}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Server error'}), 500

