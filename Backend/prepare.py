import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler


class Prepare:
    def __init__(self, userCollection, productCollection, interactionCollection):
        self.read_data(userCollection, productCollection,
                       interactionCollection)
        self.data_cleaning()
        self.feature_engineering()
        self.create_interaction_matrix()

    def read_data(self, userCollection, productCollection, interactionCollection):
        self.users_df = pd.DataFrame(userCollection.find({}))
        self.products_df = pd.DataFrame(productCollection.find({}))
        self.interactions_df = pd.DataFrame(interactionCollection.find({}))
        self.users_df['_id'] = self.users_df['_id'].apply(
            lambda value: str(value))
        self.products_df['_id'] = self.products_df['_id'].apply(
            lambda value: str(value))

    def data_cleaning(self):
        self.users_df.fillna(
            value={'age': self.users_df['age'].median()}, inplace=True)

    def feature_engineering(self, on_users=True, on_products=True):
        label_encoder = LabelEncoder()
        scaler = MinMaxScaler()
        if on_users:
            self.users_df['gender_encoded'] = label_encoder.fit_transform(
                self.users_df['gender'])
            self.users_df['age_scaled'] = scaler.fit_transform(
                self.users_df[['age']])
        if on_products:
            self.products_df['price_scaled'] = scaler.fit_transform(
                self.products_df[['price']])

    def create_interaction_matrix(self):
        self.interactions_grouped = self.interactions_df.groupby(
            ['user_id', 'product_id'])['weight'].sum().reset_index()

        self.interactions_grouped = self.interactions_grouped.join(
            self.products_df.set_index('_id'), on='product_id', how='inner')

        self.interactions_grouped = self.interactions_grouped.join(
            self.users_df.set_index('_id'), on='user_id', how='inner')

        self.interactions_grouped['weight'] += 0.5 * (self.interactions_grouped['color'].isin(self.interactions_grouped['favorite_colors'])) + 0.5 * (
            self.interactions_grouped['category'].isin(self.interactions_grouped['favorite_categories'])) - 0.1 * self.interactions_grouped['price_scaled']

        self.interactions_pivot = self.interactions_grouped.pivot(
            index='user_id', columns='product_id', values='weight').fillna(0)

        self.extended_interaction_matrix = self.interactions_pivot.apply(
            lambda row: row / row.sum(), axis=1)
        self.user_item_similarity = self.extended_interaction_matrix.div(
            self.extended_interaction_matrix.sum(axis=1), axis=0)

    def recommend_products(self, user_id, item_popularity_factor=0.5):
        if user_id not in self.user_item_similarity.index:
            return self.products_df, self.products_df.to_markdown()
        user_similarity = self.user_item_similarity.loc[user_id]
        top_product_indices = np.argsort(user_similarity.values)[::-1]
        top_product_ids = user_similarity.index[top_product_indices]

        self.recommended_products_df = top_product_ids.to_frame(
            name='_id').merge(self.products_df, on='_id')

        self.recommended_products_df['preference_score'] = user_similarity[top_product_indices].values
        self.popularity_scores = self.interactions_grouped[self.interactions_grouped['product_id'].isin(
            top_product_ids)].groupby('product_id')['weight'].sum()
        self.recommended_products_df['popularity_score'] = self.recommended_products_df['_id'].map(
            self.popularity_scores)

        self.recommended_products_df['popularity_score'].fillna(
            0, inplace=True)

        self.recommended_products_df['recommendation_score'] = (
            1 - item_popularity_factor) * self.recommended_products_df['preference_score'] + item_popularity_factor * self.recommended_products_df['popularity_score']

        return (self.recommended_products_df, self.recommended_products_df.head().to_markdown())

    def add_user(self, user_id, username, age, gender, favorite_colors, favorite_categories):
        new_user = {'_id': user_id, 'username': username, 'age': age, 'gender': gender,
                    'favorite_colors': favorite_colors, 'favorite_categories': favorite_categories}
        self.users_df = pd.concat(
            [self.users_df, pd.DataFrame([new_user])], ignore_index=True)
        self.feature_engineering(on_users=True, on_products=False)
        self.create_interaction_matrix()

    def add_product(self, product_id, category, product_name, price, image, color):
        new_product = {'_id': product_id, 'category': category,
                       'product_name': product_name, 'price': price, 'image': image, 'color': color}
        self.products_df = pd.concat(
            [self.products_df, pd.DataFrame([new_product])], ignore_index=True)
        self.feature_engineering(on_users=False, on_products=True)
        self.create_interaction_matrix()

    def add_interaction(self, interaction_id, user_id, product_id, action, value=0):
        if action == "click":
            new_interaction = {
                "_id": interaction_id, 'user_id': user_id, 'product_id': product_id, 'action': action, 'weight': 0.5}
            self.interactions_df = pd.concat(
                [self.interactions_df, pd.DataFrame([new_interaction])], ignore_index=True)
            self.feature_engineering()
            self.create_interaction_matrix()
        elif action == "purchase":
            new_interaction = {
                "_id": interaction_id, 'user_id': user_id, 'product_id': product_id, 'action': action, 'weight': 1}
            self.interactions_df = pd.concat(
                [self.interactions_df, pd.DataFrame([new_interaction])], ignore_index=True)
            self.feature_engineering()
            self.create_interaction_matrix()
        elif action == "rate":
            new_interaction = {
                "_id": interaction_id, 'user_id': user_id, 'product_id': product_id, 'action': action, 'weight': value-2}
            self.interactions_df = pd.concat(
                [self.interactions_df, pd.DataFrame([new_interaction])], ignore_index=True)
            self.feature_engineering()
            self.create_interaction_matrix()
        else:
            pass

    def sample(self):
        user_id = self.interactions_grouped['user_id'].sample().iloc[0]
        recommended_products_list, recommended_products_df = self.recommend_products(
            user_id, item_popularity_factor=0.5)
        print(
            f"\n\nEnhanced recommendations for user {self.users_df[self.users_df['_id'] == user_id]['username'].values[0]}:\n\n {recommended_products_list}")
