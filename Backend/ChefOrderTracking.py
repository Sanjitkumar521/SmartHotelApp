from flask import Blueprint, jsonify, request
from database import get_db_connection

order_bp_app = Blueprint('AcceptandReject', __name__)

@order_bp_app.route('/pending-orders', methods=['GET'])
def get_pending_orders():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Query to fetch pending orders
            query = """
            SELECT *
            FROM Orders
            WHERE order_status = 'Pending' OR order_status = 'In Progress'
            """
            cursor.execute(query)
            orders = cursor.fetchall()

            if not orders:
                return jsonify([]), 200  # Return empty list if no pending orders

            # Fetch order items for each order
            pending_orders = []
            for order in orders:
                order_id = order[0]  # order_id
                table_number = order[1]  # table_number
                order_status= order[3]
                
                # Query to fetch items for the current order, joining with Menu
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
                    'order_status': order_status,  # order_status
                    'table_number': table_number,
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

        return jsonify(pending_orders), 200

    except Exception as e:
        print(f"Error fetching pending orders: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Existing routes (unchanged)
@order_bp_app.route('/accept-order', methods=['POST'])
def accept_order():
    data = request.json
    order_id = data.get('order_id')
    chef_id = data.get('chef_id')

    if not order_id or not chef_id:
        return jsonify({"error": "Missing order_id or chef_id"}), 400

    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            print(f"Accepting Order: order_id={order_id}, chef_id={chef_id}")

            query = """
            UPDATE Orders SET order_status = 'In Progress', chef_id = %s 
            WHERE order_id = %s AND order_status = 'Pending'
            """
            cursor.execute(query, (chef_id, order_id))
            connection.commit()

            if cursor.rowcount == 0:
                return jsonify({"error": "Order not found or already accepted"}), 404

        return jsonify({"message": "Order accepted successfully"}), 200

    except Exception as e:
        print(f"Error accepting order: {str(e)}")
        return jsonify({"error": str(e)}), 500

@order_bp_app.route('/reject-order', methods=['POST'])
def reject_order():
    data = request.json
    order_id = data.get('order_id')

    if not order_id:
        return jsonify({"error": "Missing order_id"}), 400

    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            print(f"Rejecting Order: order_id={order_id}")

            query = """
            DELETE FROM Orders WHERE order_id = %s AND order_status = 'Pending'
            """
            cursor.execute(query, (order_id,))
            connection.commit()

            if cursor.rowcount == 0:
                return jsonify({"error": "Order not found or already processed"}), 404

        return jsonify({"message": "Your order has been declined."}), 200

    except Exception as e:
        print(f"Error rejecting order: {str(e)}")
        return jsonify({"error": str(e)}), 500

@order_bp_app.route('/complete-order', methods=['POST'])
def complete_order():
    data = request.json
    order_id = data.get('order_id')

    if not order_id:
        return jsonify({"error": "Missing order_id"}), 400

    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            print(f"Completing Order: order_id={order_id}")

            query = """
            UPDATE Orders SET order_status = 'Completed' 
            WHERE order_id = %s AND order_status = 'In Progress'
            """
            cursor.execute(query, (order_id,))
            connection.commit()

            if cursor.rowcount == 0:
                return jsonify({"error": "Order not found or not in progress"}), 404

        return jsonify({"message": "Order marked as completed"}), 200

    except Exception as e:
        print(f"Error completing order: {str(e)}")
        return jsonify({"error": str(e)}), 500