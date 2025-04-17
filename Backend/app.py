from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS

from register import register_bp
from login import login_bp
from menu import menu_bp
from placeOrder import order_bp
from sentiment import review_bp
from customerLoyality import loyalty_bp
from Admin import dashboard_bp
from MenuManagement import add_menu_bp,Fetch_menu_bp,update__menu_bp,delete_menu_bp
from ChefOrderTracking import order_bp_app
from userOrderTracking import userorder_bp_app
from editprofile import edit_profile_bp
from ForgotPassword import password_reset_bp
# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = '12345'
CORS(app)  # Enable CORS


app.register_blueprint(register_bp)
app.register_blueprint(login_bp)
app.register_blueprint(menu_bp)
app.register_blueprint(order_bp)
app.register_blueprint(review_bp)
app.register_blueprint(loyalty_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(add_menu_bp)
app.register_blueprint(Fetch_menu_bp)
app.register_blueprint(update__menu_bp)
app.register_blueprint(delete_menu_bp)
app.register_blueprint(order_bp_app)
app.register_blueprint(userorder_bp_app)
app.register_blueprint(edit_profile_bp)
app.register_blueprint(password_reset_bp)



# Serve the 'uploads' folder as a static directory
app.config['UPLOAD_FOLDER'] = 'uploads'

# Optional: If you need a custom route for uploads
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({"error": f"File not found: {filename}"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to serve file: {str(e)}"}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host= '0.0.0.0', port=8082, debug=True)