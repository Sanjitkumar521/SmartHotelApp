from flask import Blueprint, jsonify, request
import logging
from database import get_db_connection
from datetime import datetime
import joblib
import os

review_bp = Blueprint('review', __name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH = r"D:\fyp\fyp\Backend\model_nb.pkl"
VECTORIZER_PATH = r"D:\fyp\fyp\Backend\vectorizer.pkl"
sentiment_model = None

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Sentiment model file not found at {MODEL_PATH}")
    
    logger.info(f"Attempting to load sentiment model from {MODEL_PATH}")
    with open(MODEL_PATH, 'rb') as file:
        sentiment_model = joblib.load(file)
    logger.info("Sentiment model loaded successfully")
    
except Exception as e:
    logger.error(f"Failed to load sentiment model: {str(e)}", exc_info=True)
    sentiment_model = None
    logger.warning("Sentiment analysis will be disabled due to loading failure")

@review_bp.route('/reviews/<int:menu_id>', methods=['GET'])
def get_reviews(menu_id):
    try:
        connection = get_db_connection()
        if not connection:
            logger.error("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT r.review_id, r.rating, r.feedback, r.created_at, r.customer_name, r.sentiment,
                   m.name AS food_name
            FROM Reviews r
            JOIN Menu m ON r.menu_id = m.menu_id
            WHERE r.menu_id = %s
            ORDER BY r.created_at DESC
        """
        cursor.execute(query, (menu_id,))
        reviews = cursor.fetchall()
        
        # Standardize sentiment to lowercase
        for review in reviews:
            if review['sentiment']:
                review['sentiment'] = review['sentiment'].lower()
        
        cursor.close()
        connection.close()
        logger.info(f"Fetched {len(reviews)} reviews for menu_id {menu_id}")
        return jsonify(reviews), 200

    except Exception as e:
        logger.error(f"Error fetching reviews: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@review_bp.route('/reviews', methods=['POST'])
def submit_review():
    try:
        data = request.get_json() or {}
        logger.info(f"Received review data: {data}")

        menu_id = data.get('menu_id') or data.get('food_id')
        rating = data.get('rating')
        feedback = data.get('feedback')
        customer_name = data.get('customer_name')

        if menu_id is None:
            logger.warning("Missing required field: menu_id or food_id")
            return jsonify({"error": "Missing required field: menu_id or food_id"}), 400
        if not isinstance(menu_id, int):
            logger.warning(f"menu_id or food_id must be an integer, got {menu_id}")
            return jsonify({"error": "menu_id or food_id must be an integer"}), 400
        if rating is None:
            logger.warning("Missing required field: rating")
            return jsonify({"error": "Missing required field: rating"}), 400
        if not feedback:
            logger.warning("Missing required field: feedback")
            return jsonify({"error": "Missing required field: feedback"}), 400

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            logger.warning(f"Invalid rating: {rating}")
            return jsonify({"error": "Rating must be an integer between 1 and 5"}), 400

        sentiment = "unknown"
        if sentiment_model:
            try:
                logger.info(f"Performing sentiment analysis on feedback: {feedback}")
                if not isinstance(feedback, str):
                    logger.warning(f"Feedback is not a string: {type(feedback)}")
                    feedback = str(feedback)
                sentiment_pred = sentiment_model.predict([feedback])[0]
                logger.info(f"Predicted sentiment: {sentiment_pred}")
                sentiment = str(sentiment_pred).lower()  # Standardize to lowercase
            except Exception as e:
                logger.error(f"Sentiment analysis failed: {str(e)}", exc_info=True)
                sentiment = "unknown"
        else:
            logger.warning("Sentiment model not available, defaulting to 'unknown'")

        connection = get_db_connection()
        if not connection:
            logger.error("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        query = "SELECT menu_id, name FROM Menu WHERE menu_id = %s"
        cursor.execute(query, (menu_id,))
        food_item = cursor.fetchone()

        if not food_item:
            cursor.close()
            connection.close()
            logger.warning(f"Food item with menu_id {menu_id} not found")
            return jsonify({"error": f"Food item with menu_id {menu_id} not found"}), 404

        query = """
            INSERT INTO Reviews (menu_id, rating, feedback, customer_name, created_at, sentiment)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (menu_id, rating, feedback, customer_name or "Anonymous", datetime.utcnow(), sentiment)
        cursor.execute(query, values)
        connection.commit()

        cursor.execute("SELECT LAST_INSERT_ID() AS review_id")
        review_id = cursor.fetchone()['review_id']

        query = """
            SELECT review_id, menu_id, rating, feedback, customer_name, created_at, sentiment
            FROM Reviews WHERE review_id = %s
        """
        cursor.execute(query, (review_id,))
        new_review = cursor.fetchone()
        new_review['sentiment'] = new_review['sentiment'].lower()  # Ensure lowercase
        cursor.close()
        connection.close()

        logger.info(f"Review submitted successfully with sentiment: {sentiment}")
        return jsonify({
            "message": "Review submitted successfully",
            "review_id": new_review['review_id'],
            "review": new_review
        }), 201

    except Exception as e:
        logger.error(f"Error submitting review: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@review_bp.route('/predict', methods=['POST'])
def predict_sentiment():
    try:
        data = request.get_json() or {}
        review_text = data.get('review')
        
        if not review_text:
            logger.warning("Missing required field: review")
            return jsonify({"error": "Missing required field: review"}), 400

        if not sentiment_model:
            logger.error("Sentiment model not loaded")
            return jsonify({"error": "Sentiment analysis unavailable"}), 503

        try:
            if not isinstance(review_text, str):
                logger.warning(f"Review text is not a string: {type(review_text)}")
                review_text = str(review_text)
            sentiment = sentiment_model.predict([review_text])[0]
            logger.info(f"Predicted sentiment for '{review_text}': {sentiment}")
            return jsonify({"sentiment": str(sentiment).lower()}), 200
        except Exception as e:
            logger.error(f"Sentiment prediction failed: {str(e)}", exc_info=True)
            return jsonify({"error": "Sentiment prediction failed", "details": str(e)}), 500

    except Exception as e:
        logger.error(f"Error in sentiment prediction endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@review_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    try:
        connection = get_db_connection()
        if not connection:
            logger.error("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()
        query = "DELETE FROM Reviews WHERE review_id = %s"
        cursor.execute(query, (review_id,))
        connection.commit()

        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            logger.warning(f"Review with review_id {review_id} not found")
            return jsonify({"error": f"Review with review_id {review_id} not found"}), 404

        cursor.close()
        connection.close()
        logger.info(f"Review with review_id {review_id} deleted successfully")
        return jsonify({"message": f"Review with review_id {review_id} deleted successfully"}), 200

    except Exception as e:
        logger.error(f"Error deleting review: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@review_bp.route('/menu', methods=['GET'])
def get_menu():
    try:
        connection = get_db_connection()
        if not connection:
            logger.error("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        query = "SELECT menu_id, name, description, price, category, image_url FROM Menu"
        cursor.execute(query)
        menu_items = cursor.fetchall()
        cursor.close()
        connection.close()
        logger.info(f"Fetched {len(menu_items)} menu items")
        return jsonify(menu_items), 200

    except Exception as e:
        logger.error(f"Error fetching menu items: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500