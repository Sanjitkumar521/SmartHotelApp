from flask import Blueprint, jsonify
from database import get_db_connection  # Adjust based on your app structure

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch total orders (only "Completed" orders)
        cursor.execute("SELECT COUNT(*) FROM Orders WHERE order_status = 'Completed'")
        total_orders = cursor.fetchone()[0]

        # Fetch total sales
        cursor.execute("SELECT COALESCE(SUM(total_price), 0) FROM Orders WHERE order_status IN ('Completed')")
        total_sales = cursor.fetchone()[0]

        # Fetch total menu items
        cursor.execute("SELECT COUNT(*) FROM Menu")
        total_menu_items = cursor.fetchone()[0]

        # Fetch total customers (only users with role 'customer')
        cursor.execute("SELECT COUNT(*) FROM Users WHERE role = 'customer'")
        total_customers = cursor.fetchone()[0]

        stats = {
            "totalOrders": total_orders,
            "totalSales": float(total_sales),
            "totalMenuItems": total_menu_items,
            "totalCustomers": total_customers
        }

        return jsonify(stats)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@dashboard_bp.route('/sales-stats', methods=['GET'])
def get_sales_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                m.category AS category_name, 
                COALESCE(SUM(oi.quantity), 0) AS total_quantity
            FROM Menu m
            LEFT JOIN OrderItems oi ON m.menu_id = oi.menu_id
            LEFT JOIN Orders o ON oi.order_id = o.order_id 
                AND o.order_status IN ('Completed', 'Ready')
            GROUP BY m.category
            ORDER BY total_quantity DESC
        """)
        result = cursor.fetchall()
        labels = [row[0] if row[0] is not None else 'Uncategorized' for row in result]
        quantities = [int(row[1]) for row in result]
        return jsonify({"labels": labels, "quantities": quantities})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@dashboard_bp.route('/category-revenue', methods=['GET'])
def get_category_revenue():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                m.category AS category_name, 
                COALESCE(SUM(oi.subtotal), 0) AS total_revenue
            FROM Menu m
            LEFT JOIN OrderItems oi ON m.menu_id = oi.menu_id
            LEFT JOIN Orders o ON oi.order_id = o.order_id 
                AND o.order_status IN ('Completed', 'Ready')
            GROUP BY m.category
            ORDER BY total_revenue DESC
        """)
        result = cursor.fetchall()
        categories = [row[0] if row[0] is not None else 'Uncategorized' for row in result]
        revenues = [float(row[1]) for row in result]
        return jsonify({"categories": categories, "revenues": revenues})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()