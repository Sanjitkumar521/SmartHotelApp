from flask import Blueprint, jsonify, request, session
from database import get_db_connection
import uuid
from werkzeug.utils import secure_filename
import os

edit_profile_bp = Blueprint('edit_profile', __name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
#UPLOAD_FOLDER = 'Uploads/profile_images'
DEFAULT_PROFILE_IMAGE = '/Uploads/profile_images/default.jpg'

# Directory to store uploaded images
UPLOAD_FOLDER = 'uploads/profile_images'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@edit_profile_bp.route('/api/update-profile', methods=['POST'])
def update_profile():
    connection = None
    cursor = None
    try:
        # Check if required fields are present
        if not request.form.get('Id') or not request.form.get('fullName') or not request.form.get('phone'):
            return jsonify({
                'status': 'error',
                'error': 'Missing required fields: Id, fullName, or phone'
            }), 400

        user_id = request.form.get('Id')
        full_name = request.form.get('fullName')
        phone = request.form.get('phone')
        
        # Handle profile image upload
        profile_image_path = None
        if 'profileImage' in request.files:
            file = request.files['profileImage']
            if file and file.filename:
                # Validate file type
                if not allowed_file(file.filename):
                    return jsonify({'error': 'Invalid file type. Allowed types: jpg, jpeg, png, gif'}), 400
                # Generate a unique filename
                filename = f"{uuid.uuid4()}_{file.filename}"
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                profile_image_path = file_path
                print(f"Profile image saved to: {file_path}")

        # Validate inputs
        try:
            user_id = int(user_id)  # Convert to int since user_id is INT
        except ValueError:
            return jsonify({
                'status': 'error',
                'error': 'User ID must be a valid integer'
            }), 400

        if len(full_name.strip()) < 2:
            return jsonify({
                'status': 'error',
                'error': 'Full name must be at least 2 characters'
            }), 400

        if not phone.isdigit() or len(phone) != 10:
            return jsonify({
                'status': 'error',
                'error': 'Phone number must be exactly 10 digits'
            }), 400

        # Initialize database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'status': 'error',
                'error': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        # Find user in database
        cursor.execute("SELECT * FROM Users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({
                'status': 'error',
                'error': 'User not found'
            }), 404

        # Update user details in database
        
        # Update query, including profileImage if a new image was uploaded
        if profile_image_path:
            query = """
                UPDATE Users
                SET name = %s, phone = %s, Image_URL = %s
                WHERE user_id = %s
            """
            cursor.execute(query, (full_name, phone, profile_image_path, user_id))
        else:
            query = """
                UPDATE Users
                SET name = %s, phone = %s
                WHERE user_id = %s
            """
            cursor.execute(query, (full_name, phone, user_id))
        # cursor.execute(
        #     """
        #     UPDATE Users
        #     SET name = %s, phone = %s
        #     WHERE user_id = %s
        #     """,
        #     (full_name, phone, user_id)
        # )

        connection.commit()

        # Verify the update
        #cursor.execute("SELECT username, fullName, email, phone, profileImage FROM Users WHERE username = %s", (username,))
        cursor.execute("SELECT * FROM Users WHERE user_id = %s", (user_id,))
        updated_user = cursor.fetchone()
        cursor.close()
        connection.close()

        if not updated_user:
            return jsonify({'error': 'User not found after update'}), 404

        # Construct the image URL (assuming the Flask app serves the 'uploads' folder)
        image_url = None
        if updated_user['Image_URL']:
            profile_image = updated_user['Image_URL']
            image_url = profile_image.replace('\\', '/')
            if not image_url.startswith('/'):
                image_url = f"/{image_url}"

        session['user'] = {
            "user_id": updated_user['user_id'],
            "name": updated_user['name'],
            "email": updated_user['email'],
            "phone": updated_user['phone'],
            "Image_URL": image_url
            }

        return jsonify({
            "status": "success",
            "message": "Profile updated successfully",
            "user": session['user']
        }), 200

    except Exception as e:
        print(f"Error in update_profile: {str(e)}")
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()