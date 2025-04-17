from flask import Blueprint, jsonify, request, session
from database import get_db_connection
import bcrypt

# Define the Blueprint
login_bp = Blueprint('login', __name__)


def verify_password(stored_hash, password):
    try:
 
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')
        # Ensure password is in bytes
        password = password.encode('utf-8')
        return bcrypt.checkpw(password, stored_hash)
    except Exception as e:
        print(f"Password verification failed: {str(e)}")
        return False

# Login route
@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Missing required fields"}), 400

        connection = get_db_connection()
        if connection:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
            user = cursor.fetchone()
            cursor.close()
            connection.close()

            if not user:
                return jsonify({"error": "Email or Password do not match"}), 401

            stored_hash = user['password']
            if verify_password(stored_hash, password):
                session['user_id'] = user['user_id']
                session['role'] = user['role']
                session['name'] = user['name']
                session['email'] = user['email']
                session['Image_URL'] = user['Image_URL']
                session['phone'] = user['phone']

                return jsonify({
                    "message": "Login successful",
                    "user_id": user['user_id'],
                    "role": user['role'],
                    "name": user['name'],
                    "email": user['email'],
                    "Image_URL": user['Image_URL'],
                    "phone": user['phone']
                }), 200
            else:
                return jsonify({"error": "Email or Password do not match"}), 401

        return jsonify({"error": "Database connection failed"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}),500