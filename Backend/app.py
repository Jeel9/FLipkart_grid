from flask import Flask, jsonify, request, Response, make_response
from flask_cors import CORS
from bson import json_util
from bson.objectid import ObjectId
from pymongo import MongoClient
from config import Config
import jwt
import cloudinary.api
import cloudinary.uploader
import cloudinary
import datetime
from prepare import Prepare

from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config.from_object(Config)

app.secret_key = app.config['SECRET_KEY']

mongodb_client = MongoClient(app.config['MONGO_URI'])
print("[INFO] Database connected...")

print("[INFO] Configuring cloudinary...")
cloudinary.config(cloud_name=app.config['CLOUD_NAME'], api_key=app.config['API_KEY'],
                  api_secret=app.config['API_SECRET'])
print("[INFO] Configuring cloudinary completed.")

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

userCollection = mongodb_client.eCommerce.users
productCollection = mongodb_client.eCommerce.products
orderCollection = mongodb_client.eCommerce.orders
interactionCollection = mongodb_client.eCommerce.interactions

print("[INFO] Loading and preparing model")
prepare = Prepare(userCollection, productCollection, interactionCollection)

# prepare.sample()


@app.route('/users/signup', methods=['POST'])
def create_user():
    if 'username' in request.json and 'password' in request.json and 'age' in request.json and 'gender' in request.json and 'favorite_colors' in request.json and isinstance(request.json['favorite_colors'], list) and len(request.json['favorite_colors']) >= 1 and 'favorite_categories' in request.json and isinstance(request.json['favorite_categories'], list) and len(request.json['favorite_categories']) >= 1:
        username = request.json['username']
        password = request.json['password']
        age = int(request.json['age'])
        gender = request.json['gender']
        favorite_colors = request.json['favorite_colors']
        favorite_categories = request.json['favorite_categories']
        user = userCollection.find_one({"username": username})
        if user:
            return make_response({"error": "User with this username already exists"}, 400)
        else:
            hashed_password = generate_password_hash(password)
            user_inserted = userCollection.insert_one(
                {'username': username, 'password': hashed_password, 'age': age, 'gender': gender, 'favorite_colors': favorite_colors, 'favorite_categories': favorite_categories})

            prepare.add_user(user_inserted.inserted_id, username,
                             age, gender, favorite_colors, favorite_categories)

            response = jsonify({
                '_id': str(user_inserted.inserted_id),
                'username': username,
                'password': password
            })
            response.status_code = 200
            return response
    else:
        return make_response({"error": "Invalid number of parameters"}, 400)


@app.route('/users/login', methods=['POST'])
def login_user():
    if 'username' in request.json and 'password' in request.json:
        username = request.json['username']
        password = request.json['password']
        user = userCollection.find_one({"username": username})
        if not user:
            return make_response({"error": "User with this username doesn't exists"}, 400)
        else:
            if check_password_hash(user["password"], password):
                payload = {
                    'isadmin': True if username == "admin" else False,
                    'user_id': str(user["_id"]),
                    'username': user["username"],
                    'exp': datetime.datetime.utcnow()+datetime.timedelta(hours=1)
                }
                token = jwt.encode(
                    payload, app.config['SECRET_KEY_TOKEN'], algorithm='HS512')
                response = jsonify({
                    'token': token
                })
                response.status_code = 200
                return response
            else:
                return make_response({"error": "Incorrect credentials"}, 400)
    else:
        return make_response({"error": "Invalid number of parameters"}, 400)


@app.route('/users/<id>', methods=['GET'])
def get_user(id):
    try:
        objectId = ObjectId(id)
    except Exception:
        return make_response({"error": "Invalid object id"}, 400)
    user = userCollection.find_one({'_id': objectId})
    response = json_util.dumps(user)
    return Response(response, mimetype="application/json")


@app.route('/users/<_id>', methods=['PUT'])
def update_user(_id):
    prevUser = userCollection.find_one({'_id': ObjectId(_id), })

    if not prevUser:
        return not_found()

    username = prevUser['username'] if 'username' not in request.json else request.json['username']
    password = prevUser['password'] if 'password' not in request.json else request.json['passsword']

    if username and password:
        hashed_password = generate_password_hash(password)
        userCollection.update_one(
            {'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)}, {'$set': {'username': username, 'password': hashed_password}})
        response = jsonify({'message': 'User' + _id + 'Updated Successfuly'})
        response.status_code = 200
        return response
    else:
        return make_response({"error": "Invalid number of parameters"}, 400)

# ****************** PRODUCT *****************


@app.route('/product/all', methods=['POST'])
def allProduct():
    data = request.get_json()
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if not payload['isadmin']:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "User not found"}, 404)

                recommended_products, text = prepare.recommend_products(
                    payload['user_id'])
                recommended_products_dict = recommended_products.to_dict()
                result_list = []

                for index, _id in recommended_products_dict["_id"].items():
                    item = {"_id": _id}
                    for key, value in recommended_products_dict.items():
                        item[key] = value[index]
                    result_list.append(item)
                response = json_util.dumps(result_list)
                return Response(response, mimetype="application/json", status=200)

        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    products = productCollection.find({})
    new_products = []
    for product in products:
        new_products.append({"_id": str(product['_id']), "category": product['category'], "color": product['color'],
                            "price": product['price'], "product_name": product['product_name'], "ratings": product['ratings'], "url": product["url"]})
    response = json_util.dumps(new_products)
    return Response(response, mimetype="application/json", status=200)


@app.route('/product', methods=['POST'])
def createProduct():
    data = request.form.to_dict()
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if payload['isadmin']:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "Admin not found"}, 404)
                if 'category' in data and 'name' in data and 'price' in data and 'color' in data and 'image' in request.files and len(request.files) == 1:
                    category = data['category']
                    name = data['name']
                    price = int(data['price'])
                    color = data['color']
                    uploaded_file = None
                    try:
                        file = request.files['image']
                        uploaded_file = cloudinary.uploader.upload(file)
                    except Exception as e:
                        return make_response({"error": "Error uploading the image"}, 400)
                    product_inserted = productCollection.insert_one(
                        {'name': name, 'price': price, 'color': color, 'category': category, 'url': uploaded_file["secure_url"], 'ratings': dict({})})

                    prepare.add_product(
                        product_inserted.inserted_id, category, name, price, uploaded_file["secure_url"], color)

                    response = jsonify({
                        '_id': str(product_inserted.inserted_id),
                        'name': name,
                        'price': price,
                        'color': color,
                        'category': category,
                        'url': uploaded_file["secure_url"]
                    })
                    response.status_code = 200
                    return response
                else:
                    return make_response({"error": "Invalid number of parameters"}, 400)
            else:
                return make_response({"error": "Not authorized"}, 400)
        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    else:
        return make_response({"error": "Not authorized"}, 400)


@app.route('/product/<id>', methods=['POST'])
def get_product(id):
    data = request.get_json()
    try:
        objectId = ObjectId(id)
    except Exception:
        return make_response({"error": "Invalid object id"}, 400)
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if payload['isadmin'] == False:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "User not found"}, 404)
                product = productCollection.find_one({'_id': objectId})
                if not product:
                    return make_response({"error": "Product not found"}, 404)
                try:
                    inserted_interaction = interactionCollection.insert_one(
                        {"user_id": payload["user_id"], "product_id": id, "action": "click", "weight": 0.5})
                except Exception:
                    return make_response({"error": "Unable to create Interaction"}, 400)

                prepare.add_interaction(
                    inserted_interaction.inserted_id, payload['user_id'], id, "click")

                response = json_util.dumps(product)
                return Response(response, mimetype="application/json")

        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    else:
        product = productCollection.find_one({'_id': ObjectId(id), })
        if not product:
            return make_response({"error": "Product not found"}, 404)
        response = json_util.dumps(product)
        return Response(response, mimetype="application/json")


@app.route('/product/<_id>', methods=['PUT'])
def update_product(_id):
    data = request.form.to_dict()
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if payload['isadmin']:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "Admin not found"}, 404)
                prevProduct = productCollection.find_one(
                    {'_id': ObjectId(_id), })

                if not prevProduct:
                    return not_found()

                category = prevProduct['category'] if 'category' not in data else data['category']
                name = prevProduct['name'] if 'name' not in data else data['name']
                price = prevProduct['price'] if 'price' not in data else int(
                    data['price'])
                color = prevProduct['color'] if 'color' not in data else data['color']
                url = prevProduct['url']
                if 'image' in request.files and len(request.files) == 1:
                    try:
                        file = request.files['image']
                        uploaded_file = cloudinary.uploader.upload(file)
                        url = uploaded_file['secure_url']
                    except Exception as e:
                        return make_response({"error": "Error uploading the image"}, 400)

                productCollection.update_one(
                    {'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)}, {'$set': {'category': category, 'name': name, 'price': price, 'color': color, 'url': url}})
                response = jsonify(
                    {'message': 'User' + _id + 'Updated Successfuly'})
                response.status_code = 200
                return response
            else:
                return make_response({"error": "Not authorized"}, 400)
        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    else:
        return make_response({"error": "Not authorized"}, 400)


@app.route('/order', methods=['POST'])
def createOrder():
    data = request.get_json()
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if payload['isadmin'] == False:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "User not found"}, 404)
                if 'productId' in data and type(data['productId']) == list and len(data['productId']) >= 1 and 'productSum' in data and type(data['productSum']) == int and 'shippingSum' in data and type(data['shippingSum']) == int and 'totalSum' in data and type(data['totalSum']) == int and 'quantity' in data and type(data['quantity']) == list and len(data['quantity']) >= 1:
                    for id in data['productId']:
                        try:
                            objectId = ObjectId(id)
                        except Exception as e:
                            return make_response({"error": "Invalid Product Id"}, 400)

                        productFound = productCollection.find_one(objectId)
                        if not productFound:
                            return make_response({"error": "Product not Found"}, 400)

                        try:
                            inserted_interaction = interactionCollection.insert_one(
                                {"user_id": payload["user_id"], "product_id": id, "action": "purchase", "weight": 1})
                        except Exception:
                            return make_response({"error": "Unable to create Interaction"}, 400)

                        prepare.add_interaction(
                            inserted_interaction.inserted_id, payload['user_id'], id, "product")

                    orderCollection.insert_one(
                        {"userId": payload['user_id'], "productIds": data['productId'], "productSum": data['productSum'], "shippingSum": data['shippingSum'], "totalSum": data['totalSum'], "quantity": data['quantity']})

                    response = jsonify({
                        'success': "Order created successfully",
                    })
                    response.status_code = 200
                    return response

                else:
                    return make_response({"error": "Invalid Parameters"}, 400)
            else:
                return make_response({"error": "Not authorized"}, 400)
        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    else:
        return make_response({"error": "Not authorized"}, 400)


@app.route('/order/all', methods=['POST'])
def allOrders():
    data = request.get_json()
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if payload['isadmin'] == False:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "User not found"}, 404)
                my_orders_cursor = orderCollection.find(
                    {"userId": payload['user_id']})
                my_orders = []
                for order in my_orders_cursor:
                    order_products = []
                    for productId in order['productIds']:
                        product = productCollection.find_one(
                            {"_id": ObjectId(productId)})
                        order_products.append(product)
                    my_orders.append(
                        {'_id': order["_id"], "userId": order["userId"], "products": order_products, "quantity": order["quantity"], "productSum": order["productSum"], "shippingSum": order["shippingSum"], "totalSum": order["totalSum"]})
                response = json_util.dumps(my_orders[::-1])
                return Response(response, mimetype="application/json", status=200)
            else:
                return make_response({"error": "Not authorized"}, 400)
        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    else:
        return make_response({"error": "Not authorized"}, 400)


@app.route('/rate/<id>', methods=['POST'])
def rateProduct(id):
    try:
        objectId = ObjectId(id)
    except:
        return make_response({"error": "Invalid Product Id"}, 400)

    data = request.get_json()
    if 'token' in data:
        try:
            payload = jwt.decode(
                data['token'], app.config['SECRET_KEY_TOKEN'], algorithms=['HS512'])
            if payload['isadmin'] == False:
                user = userCollection.find_one(
                    {"_id": ObjectId(payload['user_id'])})
                if not user:
                    return make_response({"error": "User not found"}, 404)
                productFound = productCollection.find_one(objectId)
                if not productFound:
                    return make_response({"error": "Product not Found"}, 400)

                userId = payload['user_id']

                if not userId:
                    return make_response({"error": "Invalid User"}, 400)

                if userId in productFound['ratings']:
                    return make_response({"error": "Already Rated"}, 400)

                productFound['ratings'][userId] = data['rating']
                productCollection.update_one(
                    {'_id': ObjectId(id)},
                    {'$set': {'ratings': productFound['ratings']}}
                )

                try:
                    insertedInteraction = interactionCollection.insert_one(
                        {"user_id": payload["user_id"], "product_id": id, "action": "rate", "weight": data['rating']-2})
                except Exception:
                    return make_response({"error": "Unable to create Interaction"}, 400)

                prepare.add_interaction(
                    insertedInteraction.inserted_id, payload['user_id'], id, "rate", value=data['rating']-2)

                return make_response({"message": "Successfully rated product"}, 200)
            else:
                return make_response({"error": "Not authorized"}, 400)
        except jwt.ExpiredSignatureError:
            return make_response({"error": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            return make_response({'error': 'Token is invalid'}, 401)
    else:
        return make_response({"error": "Not authorized"}, 400)


@app.route('/colorSuggestion', methods=['GET'])
def availableColors():
    return make_response({"colors": prepare.products_df['color'].unique().tolist(), "color_hex": prepare.products_df['color_hex'].unique().tolist()}, 200)


@app.route('/categorySuggestion', methods=['GET'])
def availableCategories():
    return make_response({"categories": prepare.products_df['category'].unique().tolist()}, 200)


@app.errorhandler(404)
def not_found():
    message = {
        'message': 'Resource Not Found',
        'status': 404
    }
    response = jsonify(message)
    response.status_code = 404
    return response


if __name__ == "__main__":
    app.run(debug=True, port=5000)
