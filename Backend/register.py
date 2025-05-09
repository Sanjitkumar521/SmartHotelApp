from flask import Blueprint, jsonify, request
from database import get_db_connection
import bcrypt

register_bp = Blueprint('register', __name__)

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Register route
@register_bp.route('/register', methods=['POST'])
def register():
    connection = None
    cursor = None
    try:
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        phone = request.form.get('phone')
        role = request.form.get('role')

        if not name or not email or not password or not phone or not role:
            print("Error: Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        print(f"Role received: {role}")
        print(f"Received data: {email}")

        allowed_roles = ['Admin', 'Chef', 'Customer']
        if role not in allowed_roles:
            print(f"Error: Invalid role '{role}' received")
            return jsonify({"error": "Invalid role. Choose from 'Admin', 'Chef', or 'Customer'."}), 400

        connection = get_db_connection()
        if connection:
            # Use a buffered cursor to avoid "Unread result found" error
            cursor = connection.cursor(buffered=True)
            
            # Check if email already exists
            cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
            existing_email = cursor.fetchone()
            if existing_email:
                print(f"Error: Email {email} already registered")
                return jsonify({"error": "Email already registered"}), 409

            # Check if phone number already exists
            cursor.execute("SELECT * FROM Users WHERE phone = %s", (phone,))
            existing_phone = cursor.fetchone()
            if existing_phone:
                print(f"Error: Phone number {phone} already registered")
                return jsonify({"error": "Phone number already registered"}), 409

            hashed_password = hash_password(password)

            insert_query = """
            INSERT INTO Users (name, email, phone, password, role)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (name, email, phone, hashed_password, role))
            connection.commit()

            return jsonify({"message": "User registered successfully"}), 200
        else:
            print("Error: Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500
    finally:
        # Ensure cursor and connection are closed properly
        if cursor:
            cursor.close()
        if connection:
            connection.close()