from flask import Blueprint, jsonify, session, request
from database import get_db_connection
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

loyalty_bp = Blueprint('loyalty', __name__)

@loyalty_bp.route('/loyalty', methods=['GET'])
def get_loyalty_details():
    try:
        user_id = session.get('user_id')
        if not user_id:
            logging.error("No user_id in session")
            return jsonify({"error": "User not authenticated"}), 401

        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)

            # Fetch user and loyalty details
            cursor.execute("""
                SELECT u.user_id, u.name, u.email, u.Image_URL, cl.loyalty_points, cl.tier, 
                       cl.discount_percentage, cl.redeemed_discount
                FROM Users u
                LEFT JOIN CustomerLoyalty cl ON u.user_id = cl.user_id
                WHERE u.user_id = %s
            """, (user_id,))
            user = cursor.fetchone()

            if not user:
                logging.error(f"User not found for user_id: {user_id}")
                return jsonify({"error": "User not found"}), 404

            # Count completed orders
            cursor.execute("""
                SELECT COUNT(*) as completed_orders
                FROM Orders
                WHERE customer_id = %s AND order_status = 'Completed'
            """, (user_id,))
            completed_orders = cursor.fetchone()['completed_orders']

            # Calculate points (50 points per completed order)
            points_earned = completed_orders * 50
            if user['loyalty_points'] is None or user['loyalty_points'] < points_earned:
                cursor.execute("""
                    INSERT INTO CustomerLoyalty (user_id, customer_name, loyalty_points, discount_percentage, tier, redeemed_discount)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        loyalty_points = %s,
                        discount_percentage = %s,
                        tier = %s,
                        redeemed_discount = %s
                """, (
                    user_id, user['name'], points_earned, 0.00, 'Bronze', False,
                    points_earned, 0.00, 'Bronze', False
                ))
                connection.commit()
                user['loyalty_points'] = points_earned
                user['tier'] = 'Bronze'
                user['discount_percentage'] = 0.00
                user['redeemed_discount'] = False

            # Update tier and discount based on points
            old_tier = user['tier']
            tier = user['tier']
            discount_percentage = user['discount_percentage']
            redeemed_discount = user['redeemed_discount'] if user['redeemed_discount'] is not None else False

            if user['loyalty_points'] >= 3000:
                tier = 'Platinum'
                discount_percentage = 50.00
            elif user['loyalty_points'] >= 2000:
                tier = 'Gold'
                discount_percentage = 25.00
            elif user['loyalty_points'] >= 1000:
                tier = 'Silver'
                discount_percentage = 15.00
            else:
                tier = 'Bronze'
                discount_percentage = 0.00

            # Log tier change in LoyaltyActivities
            if tier != old_tier:
                discount_message = f"For {tier} you will get {int(discount_percentage)}% discount"
                cursor.execute("""
                    INSERT INTO LoyaltyActivities (user_id, description, points_change, amount)
                    VALUES (%s, %s, %s, %s)
                """, (user_id, discount_message, 0, f"{discount_percentage}% discount"))
                connection.commit()

            if tier != user['tier'] or discount_percentage != user['discount_percentage'] or redeemed_discount != user['redeemed_discount']:
                cursor.execute("""
                    UPDATE CustomerLoyalty
                    SET tier = %s, discount_percentage = %s, redeemed_discount = %s
                    WHERE user_id = %s
                """, (tier, discount_percentage, redeemed_discount, user_id))
                connection.commit()

            # Fetch recent activities
            cursor.execute("""
                SELECT activity_id, description, points_change, amount, activity_time
                FROM LoyaltyActivities
                WHERE user_id = %s
                ORDER BY activity_time DESC
                LIMIT 5
            """, (user_id,))
            activities = cursor.fetchall()

            # Calculate points to next tier
            points_to_next_reward = 0
            if tier == 'Bronze':
                points_to_next_reward = 1000 - user['loyalty_points']
            elif tier == 'Silver':
                points_to_next_reward = 2000 - user['loyalty_points']
            elif tier == 'Gold':
                points_to_next_reward = 3000 - user['loyalty_points']
            elif tier == 'Platinum':
                points_to_next_reward = 0  # No next tier

            return jsonify({
                "status": "success",
                "user": {
                    "user_id": user['user_id'],
                    "name": user['name'],
                    "email": user['email'],
                    "Image_URL": user['Image_URL'],
                    "loyalty_points": user['loyalty_points'] or 0,
                    "tier": tier,
                    "discount_percentage": float(discount_percentage),
                    "redeemed_discount": redeemed_discount,
                    "points_to_next_reward": max(0, points_to_next_reward),
                    "recent_activities": [
                        {
                            "id": activity['activity_id'],
                            "description": activity['description'],
                            "points_change": activity['points_change'],
                            "amount": activity['amount'],
                            "activity_time": activity['activity_time'].isoformat()
                        } for activity in activities
                    ]
                }
            }), 200

    except Exception as e:
        logging.error(f"Error fetching loyalty details: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@loyalty_bp.route('/loyalty/redeem/silver', methods=['POST'])
def redeem_silver_discount():
    try:
        user_id = session.get('user_id')
        if not user_id:
            logging.error("No user_id in session")
            return jsonify({"error": "User not authenticated"}), 401

        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT loyalty_points, tier, discount_percentage, redeemed_discount
                FROM CustomerLoyalty
                WHERE user_id = %s
            """, (user_id,))
            loyalty = cursor.fetchone()

            if not loyalty:
                logging.error(f"Loyalty record not found for user_id: {user_id}")
                return jsonify({"error": "Loyalty record not found"}), 404

            if loyalty['tier'] != 'Silver' or loyalty['discount_percentage'] != 15.00:
                logging.warning(f"User {user_id} not eligible for Silver discount")
                return jsonify({"error": "Not eligible for 15% discount"}), 403

            if loyalty['redeemed_discount']:
                logging.warning(f"User {user_id} has already redeemed Silver discount")
                return jsonify({"error": "Silver discount already redeemed"}), 403

            # Mark discount as redeemed
            cursor.execute("""
                UPDATE CustomerLoyalty
                SET redeemed_discount = TRUE
                WHERE user_id = %s
            """, (user_id,))

            # Log the redemption in LoyaltyActivities
            cursor.execute("""
                INSERT INTO LoyaltyActivities (user_id, description, points_change, amount)
                VALUES (%s, %s, %s, %s)
            """, (user_id, "You have used your redeem", 0, "15% discount"))
            connection.commit()

            return jsonify({
                "status": "success",
                "message": "15% Silver discount redeemed."
            }), 200

    except Exception as e:
        logging.error(f"Error redeeming Silver discount: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@loyalty_bp.route('/loyalty/redeem', methods=['POST'])
def redeem_discount():
    try:
        user_id = session.get('user_id')
        if not user_id:
            logging.error("No user_id in session")
            return jsonify({"error": "User not authenticated"}), 401

        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT loyalty_points, tier, discount_percentage, redeemed_discount
                FROM CustomerLoyalty
                WHERE user_id = %s
            """, (user_id,))
            loyalty = cursor.fetchone()

            if not loyalty:
                logging.error(f"Loyalty record not found for user_id: {user_id}")
                return jsonify({"error": "Loyalty record not found"}), 404

            if loyalty['tier'] != 'Platinum' or loyalty['discount_percentage'] != 50.00:
                logging.warning(f"User {user_id} not eligible for Platinum discount")
                return jsonify({"error": "Not eligible for 50% discount"}), 403

            # Reset points and tier after Platinum discount redemption
            cursor.execute("""
                UPDATE CustomerLoyalty
                SET loyalty_points = 0, tier = 'Bronze', discount_percentage = 0.00, redeemed_discount = FALSE
                WHERE user_id = %s
            """, (user_id,))

            # Log the redemption in LoyaltyActivities
            cursor.execute("""
                INSERT INTO LoyaltyActivities (user_id, description, points_change, amount)
                VALUES (%s, %s, %s, %s)
            """, (user_id, "Redeemed 50% Platinum discount", -loyalty['loyalty_points'], "50% discount"))
            connection.commit()

            return jsonify({
                "status": "success",
                "message": "50% discount redeemed. Points and tier reset."
            }), 200

    except Exception as e:
        logging.error(f"Error redeeming discount: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500