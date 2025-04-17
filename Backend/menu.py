from flask import Blueprint, jsonify, request
from database import get_db_connection

# Define the Blueprint
menu_bp = Blueprint('menu', __name__)

# Route to fetch all menu items with optional search
@menu_bp.route('/menu', methods=['GET'])
def get_menu():
    try:
        search_query = request.args.get('search', '').strip() 
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        
        if search_query:

            query = "SELECT * FROM Menu WHERE LOWER(name) LIKE %s"
            cursor.execute(query, (f'%{search_query.lower()}%',))
        else:
            # Fetch all items if no search query
            cursor.execute("SELECT * FROM Menu")
        
        menu_items = cursor.fetchall()
        cursor.close()
        connection.close()

        if not menu_items:
            return jsonify({"message": "No menu items found"}), 200

        return jsonify(menu_items), 200

    except Exception as e:
        print(f"Error fetching menu: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500