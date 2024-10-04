import numpy as np
from collections import Counter
from joblib import Parallel, delayed
from DecisionTree import DecisionTree

class RandomForest:

    def __init__(self, n_tree, max_depth, min_split, n_feature=None):
        
        # Setup the random forest
        self.n_tree = n_tree
        self.max_depth = max_depth
        self.min_split = min_split
        self.n_feature = n_feature
        self.group_tree = []

    def fit(self, X, Y):
        
        # Storage for trees and feature importance scores
        self.group_tree = []
        self.all_score = np.zeros(X.shape[1]) 

        # Train trees using all CPU cores
        results = Parallel(n_jobs=-1)(delayed(self.train)(X, Y) for _ in range(self.n_tree))

        # Iterate all tree
        for tree, score in results:

            # Add trained tree to the storage
            self.group_tree.append(tree)

            # Add feature importance score from the tree
            self.all_score += score

        # Average the feature importance score
        self.all_score /= self.n_tree

    def train(self, X, Y):

        # Create a tree
        tree = DecisionTree(max_depth=self.max_depth, min_split=self.min_split, n_feature=self.n_feature)
        
        # Create a bootstrap data
        X_sample, Y_sample = self.bootstrap(X, Y)

        # Train the tree
        tree.fit(X_sample, Y_sample)

        # Return trained tree and score
        return tree, tree.score

    def bootstrap(self, X, Y):

        # Get total number of rows in dataframe
        samples = X.shape[0]

        # Create bootstrapped data indices
        index = np.random.choice(samples, samples, replace=True)
        
        # Split the data, X = features Y = label
        return X[index], Y[index]

    def label(self, Y):

        # Create a counter
        counter = Counter(Y)

        # Get and return the most common label per sample
        common = counter.most_common(1)[0][0]

        # Return class
        return common
    
    def predict_proba(self, X): 

        # Make predictions using trees
        predictions = np.array([tree.predict(X) for tree in self.group_tree])
        
        # Get all predictions of tree per sample
        tree_predictions = np.swapaxes(predictions, 0, 1)

        # Store predictions
        probas = []

        # Iterate all predictions per sample
        for pred in tree_predictions:

            # Count occurances per class
            counts = Counter(pred)

            # Get count of 0 then divide to all trees and get count of 1 then divide to all trees
            probas.append([counts.get(0, 0)/ self.n_tree, counts.get(1,0)/ self.n_tree])

        # Return probabilities
        return np.array(probas)

    def predict(self, X):

        # Make predictions using trees
        predictions = np.array([tree.predict(X) for tree in self.group_tree])

        # Get all predictions of tree per sample
        tree_predictions = np.swapaxes(predictions, 0, 1)

        # Store and return most common label per sample
        final_predictions = np.array([self.label(pred) for pred in tree_predictions])

        # Return predictions
        return tree_predictions, final_predictions