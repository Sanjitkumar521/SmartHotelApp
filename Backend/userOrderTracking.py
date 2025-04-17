from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime

userorder_bp_app = Blueprint('AcceptandRejectOrders', __name__)

@userorder_bp_app.route('/pendingorders', methods=['post'])
def get_pending_orders():
    try:
        customer_id = request.form.get('user_id')  # Get customer_id from query params
        print(f"Received customer_id: {customer_id}")
        if not customer_id:
            return jsonify({"error": "customer_id is required"}), 400

        connection = get_db_connection()
        with connection.cursor() as cursor:
            # First, query for Pending orders
            pending_query = """
            SELECT order_id, table_number, order_status
            FROM Orders
            WHERE order_status = 'Pending'
            AND customer_id = %s
            """
            cursor.execute(pending_query, (customer_id,))
            orders = cursor.fetchall()

            # If no Pending orders, query for In Progress orders
            if not orders:
                in_progress_query = """
                SELECT order_id, table_number, order_status
                FROM Orders
                WHERE order_status = 'In Progress'
                AND customer_id = %s
                """
                cursor.execute(in_progress_query, (customer_id,))
                orders = cursor.fetchall()
                
            if not orders:
                today = datetime.now().strftime('%Y-%m-%d')
                completed_query = """
                SELECT order_id, table_number, order_status
                FROM Orders
                WHERE order_status = 'Completed'
                AND customer_id = %s
                AND DATE(order_time) = %s
                """
                cursor.execute(completed_query, (customer_id, today))
                orders = cursor.fetchall()

            # If still no orders, return empty array
            if not orders:
                print(f"No Pending or In Progress orders found for customer_id: {customer_id}")
                return jsonify([]), 200
            
            pending_orders = []
            for order in orders:
                order_id = order[0]
                table_number = order[1]
                order_status = order[2]

                # Fetch order items
                items_query = """
                SELECT m.name AS food_name, oi.quantity, oi.subtotal
                FROM OrderItems oi
                JOIN Menu m ON oi.menu_id = m.menu_id
                WHERE oi.order_id = %s
                """
                cursor.execute(items_query, (order_id,))
                items = cursor.fetchall()
                
                order_data = {
                    'order_id': order_id,
                    'table_number': table_number,
                    'status': order_status,
                    'items': [
                        {
                            'food_name': item[0],
                            'quantity': item[1],
                            'subtotal': float(item[2])
                        }
                        for item in items
                    ]
                }
                pending_orders.append(order_data)
        print(pending_orders)       

        return jsonify(pending_orders), 200

    except Exception as e:
        print(f"Error fetching pending orders: {str(e)}")
        return jsonify({"error": str(e)}), 500