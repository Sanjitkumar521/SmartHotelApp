from flask import Blueprint, jsonify, request
from database import get_db_connection
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime
import bcrypt

# Global variable to store OTP
GLOBAL_OTP = None
Global_email = None

# Define the Blueprint
password_reset_bp = Blueprint('password_reset', __name__)

# Gmail SMTP configuration
GMAIL_USER = 'chysanjit13@gmail.com'  # Replace with your Gmail address
GMAIL_PASSWORD = 'ucbi wijn fxeq khel'  # Replace with your Gmail App Password

def send_otp_email(to_email, otp):
    try:
        msg = MIMEMultipart()
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = 'Password Reset OTP'

        body = f"""
        Hello,

        You requested a password reset. Please use the following 5-digit OTP to proceed:

        OTP: {otp}

        This OTP is valid for 15 minutes. If you did not request this, please ignore this email.

        Best regards,
        Your App Team
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
        server.quit()
        print(f"OTP email sent successfully to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("SMTP Authentication Error: Check Gmail username and App Password")
        return False
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {str(e)}")
        return False
    except Exception as e:
        print(f"Failed to send OTP email: {str(e)}")
        return False

@password_reset_bp.route('/password_reset', methods=['POST'])
def send_password_reset_otp():
    global GLOBAL_OTP
    global Global_email
    print("Entering /password_reset")
    try:
        email = request.form.get('email')
        print(f"Received email: {email}")
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Check if username already exists
        # Check if username or email already exists
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))

        user = cursor.fetchone()
        print(f"User found: {user}")
    
        if not user:
            # assuming email is in the 2nd column
            return jsonify({"error": "User with this email not foud"}),400
        
        Global_email= email
        
        # Generate a 5-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(5)])
        GLOBAL_OTP = str(otp)
        print(f"Generated OTP: {GLOBAL_OTP}")
        
        # Send the OTP via email
        if not send_otp_email(email, otp):
            return jsonify({"error": "Failed to send OTP email"}), 500

        return jsonify({"message": "OTP sent successfully"}), 200
    except Exception as e:
        print(f"Error in /password_reset: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@password_reset_bp.route('/password_reset_OTP', methods=['POST'])
def verify_password_reset_otp():
    global GLOBAL_OTP
    print("Entering /password_reset_OTP")
    print(f"Current GLOBAL_OTP: {GLOBAL_OTP}")
    try:
        received_otp = request.form.get('value')
        print(f"Received OTP: {received_otp}")
        if not received_otp:
            return jsonify({"error": "OTP is required"}), 400
        
        if GLOBAL_OTP is None:
            return jsonify({"error": "No OTP generated. Please request a new OTP"}), 400

        if received_otp == GLOBAL_OTP:
            GLOBAL_OTP = None  # Clear OTP after verification
            return jsonify({"message": "OTP verified successfully"}), 200
        else:
            return jsonify({"error": "Invalid OTP"}), 400
    except Exception as e:
        print(f"Error in /password_reset_OTP: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


@password_reset_bp.route('/update_password', methods=['POST'])
def update_password():
    global Global_email
    print(f"Current updating user: {Global_email}")
    print("Entering /update_password")
    try:
        new_password = request.form.get('password')

        if not new_password:
            return jsonify({"error": "password are required"}), 400

        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long"}), 400

        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

        # Update the password in the Users table
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "UPDATE Users SET password = %s WHERE email = %s"
        cursor.execute(query, (hashed_password, Global_email))
        conn.commit()

        # Check if any rows were affected
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        cursor.close()
        conn.close()

        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        print(f"Error in /update_password: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500