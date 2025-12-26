from bson import ObjectId
import pandas as pd
# import ast
import random
from pymongo import MongoClient
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash

# Connect to the MongoDB server
client = MongoClient(
    Config.MONGO_URI)
db = client['eCommerce']  # Replace with your database name
interactionCollection = db['interactions']  # Replace with your collection name
userCollection = db['users']
productCollection = db['products']


# Read the CSV file into a pandas DataFrame
# csv_file = 'newInteractions.csv'  # Replace with your CSV file path
# data = pd.read_csv(csv_file)

# csv_file = 'products(1).csv'  # Replace with your CSV file path
# product_data = pd.read_csv(csv_file)
# print(product_data.columns)
# product_data = product_data.drop(columns=['product_id'], axis=1)
# print(product_data.columns)
# product_data.rename(columns={"image": "url"}, inplace=True)


# def generate_user_interaction(user_id, product_id):
#     action = random.choice(['click', 'purchase', 'rate'])
#     if action == 'click':
#         weight = 0.5
#     elif action == 'purchase':
#         weight = 1.0
#     else:
#         weight = 1.5

#     return {
#         'user_id': user_id,
#         'product_id': product_id,
#         'action': action,
#         'weight': weight
#     }

# Generate synthetic data

# userCollection.update_many({}, {'$rename': {"user_name": "username"}})
# userCollection.update_many(
#     {}, {'$set': {"password": generate_password_hash("abc@123")}})
# productCollection.update_many(
#     {}, {'$set': {"ratings": dict({})}})

for product in productCollection.find():
    price_str = product["price"]
    try:
        price_int = int(price_str)
        productCollection.update_one(
            {"_id": product["_id"]},
            {"$set": {"price": price_int}}
        )
    except ValueError:
        print(f"Error converting price for product id: {price_str}")

# usersFound = userCollection.find({})
# productsFound = productCollection.find({})
# interactionsFound = interactionCollection.find({}).sort('_id',-1)
# lastDocument = interactionsFound.next()
# print(lastDocument)
# interactionCollection.delete_one({'_id':lastDocument['_id']})

# users = pd.DataFrame(list(usersFound))
# products = pd.DataFrame(list(productsFound))
# interactions = pd.DataFrame(list(interactionsFound))

# num_users = len(users)
# num_products = len(products)
# num_interactions = int(0.25*(num_users*num_products))

# print(users.head(1))
# print(products.head(1))

# print(num_users)
# print(num_products)
# print(num_interactions)

# print(products.sample()["_id"])
# print(products.sample()["_id"].values[0])

# print(users.sample()['_id'].values[0])

# interactions = [generate_user_interaction(users.sample()['_id'].values[0], products.sample()[
#                                           "_id"].values[0]) for _ in range(num_interactions)]
# interactions_df = pd.DataFrame(interactions)
# interactions_df.to_csv('newInteractions.csv', index=False)

# def convert_to_list(value):
#     return ast.literal_eval(value)

# # Apply the function to the desired column
# data['favorite_colors'] = data['favorite_colors'].apply(convert_to_list)
# data['favorite_categories'] = data['favorite_categories'].apply(convert_to_list)

# Convert DataFrame to a list of dictionaries (one dictionary per row)
# data_dict = data.to_dict(orient='records')
# data_dict = data.drop(columns=['user_id']).to_dict(orient='records')


# # Insert the data into the MongoDB collection
# interactionCollection.insert_many(data_dict)


# print("CSV data imported into MongoDB successfully.")
