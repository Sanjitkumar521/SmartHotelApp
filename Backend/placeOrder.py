from flask import Blueprint, request, jsonify
from database import get_db_connection

order_bp = Blueprint('order', __name__)

@order_bp.route('/place-order', methods=['POST'])
def place_order():
    data = request.json
    table_number = data.get('table_number')
    customer_id = data.get('customer_id')
    items = data.get('cart_items')  # List of { menu_id, quantity, subtotal }
    print(f"Received order data: {data}")

    if not table_number or not customer_id or not items:
        return jsonify({"error": "Missing table_number, customer_id, or items"}), 400

    print(f"Received order data: {data}")
    
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Calculate total price
            total_price = sum(item['subtotal'] for item in items)

            # Insert into Orders table
            query = """
            INSERT INTO Orders (table_number, customer_id, order_status, total_price)
            VALUES (%s, %s, 'Pending', %s)
            """
            cursor.execute(query, (table_number, customer_id, total_price))
            order_id = cursor.lastrowid  # Get the newly created order_id
            
            # Update UserRewards table by increasing the orders value for the user
            update_query = """
            UPDATE UserRewards
            SET orders = orders + 1
            WHERE user_id = %s
            """
            cursor.execute(update_query, (customer_id,))  # Assuming customer_id is the same as user_id

            # Insert into OrderItems table
            for item in items:
                query = """
                INSERT INTO OrderItems (order_id, menu_id, quantity, subtotal)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(query, (order_id, item['menu_id'], item['quantity'], item['subtotal']))

            connection.commit()
            return jsonify({"message": "Order placed successfully", "order_id": order_id}), 201

    except Exception as e:
        print(f"Error placing order: {str(e)}")
        return jsonify({"error": str(e)}), 500