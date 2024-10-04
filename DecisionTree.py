import math
import numpy as np
from collections import Counter

class Node:

    def __init__(self, feature=None, threshold=None, left=None, right=None, *, value=None):
        
        # Setup the node
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value
        
    def leaf(self):

        # Determine if current node is leaf or not
        return self.value is not None

class DecisionTree:

    def __init__(self, min_split, max_depth, n_feature=None):
        
        # Setup the decision tree
        self.min_split = min_split
        self.max_depth = max_depth
        self.n_feature = n_feature
        self.root = None
        self.score = None  

    def fit(self, X, Y):

        # Get number of features to use
        self.n_feature = int(math.sqrt(X.shape[1])) if not self.n_feature else min(X.shape[1], self.n_feature)
        
        # Storage for importance score of each feature 
        self.score = np.zeros(X.shape[1])

        # Build and store the tree
        self.root = self.grow(X, Y)

        # Normalize feature importance scores
        self.score /= np.sum(self.score)

    def grow(self, X, Y, depth=0):

        # Store number of rows and features
        samples, features = X.shape

        # Store number of unique class labels
        labels = len(np.unique(Y))

        # Stopping criteria: tree reached maximum depth or number of sample is less than split size or all labels are same
        if (depth >= self.max_depth or samples < self.min_split or labels == 1):
            
            # If stopping criteria is met, most common label will be calculated
            leaf = self.label(Y)
            
            # Return node with most common label value
            return Node(value=leaf)

        # Get index of random features to use
        index = np.random.choice(features, self.n_feature, replace=False)
        
        # Store feature, threshold, and gain
        best_feature, best_threshold, best_gain = self.best(X, Y, index)

        # Check if there is best feature
        if best_feature is None:

            # No valid split found, return leaf node
            leaf = self.label(Y)
            return Node(value=leaf)

        # Split the samples
        left_index, right_index = self.split(X[:, best_feature], best_threshold)
        
        # Check if there is empty side 
        if len(left_index) == 0 or len(right_index) == 0:

            # Get most common label, return leaf node
            leaf = self.label(Y)
            return Node(value=leaf)

        # Recursively grow the tree
        left = self.grow(X[left_index, :], Y[left_index], depth + 1)
        right = self.grow(X[right_index, :], Y[right_index], depth + 1)
        
        # Updates importance score
        self.score[best_feature] += best_gain

        # Return a new node
        return Node(best_feature, best_threshold, left, right)
    
    def label(self, Y):

        # Create counter of each class
        counter = Counter(Y)

        # Get most common class
        common = counter.most_common(1)[0][0]

        # Return class
        return common

    def best(self, X, Y, index):
        
        # Initialize value lower than any possible gain
        gain = -1

        # Store index of best feature and threshold for split
        split_index, split_threshold = None, None
        
        # Store gain for best split
        split_gain = 0

        # Find best split for each feature
        for i in index:

            # Get column values of feature
            X_column = X[:, i]

            # Get unique value of column which will be used as threshold
            thresholds = np.unique(X_column)

            # Iterate over all thresholds
            for t in thresholds:

                # Get gain for splitting at threshold
                gini_gain = self.gain(Y, X_column, t)

                # If current split gain is greater than best gain so far, update variables
                if gini_gain > gain:
                    gain = gini_gain
                    split_index = i
                    split_threshold = t
                    split_gain = gini_gain

        # Return index of best feature, threshold for splitting, and gain
        return split_index, split_threshold, split_gain

    def gain(self, Y, X_column, threshold):
        
        # Get parent impurity before split
        parent_gini = self.gini(Y)

        # Split the data based on the threshold
        left_index, right_index = self.split(X_column, threshold)

        # Check if split is meaningful
        if len(left_index) == 0 or len(right_index) == 0:
            
            # Return 0 gain if invalid split
            return 0
        
        # Get number of samples in parent node
        n = len(Y)
        
        # Get number of samples in left and right
        n_l, n_r = len(left_index), len(right_index)

        # Compute impurity for left and right
        gini_l, gini_r = self.gini(Y[left_index]), self.gini(Y[right_index])
        
        # Calculate weighted impurity
        child_gini = (n_l / n) * gini_l + (n_r / n) * gini_r

        # Calculate the gain
        gini_gain = parent_gini - child_gini

        # Return the gain
        return gini_gain
    
    def gini(self, Y):

        # Count occurances of each class
        hist = np.bincount(Y)

        # Compute proportions of each class
        proportion = hist / len(Y)

        # Calculate and return purity based on proportions
        return 1 - np.sum(proportion**2)

    def split(self, X_column, split_threshold):

        # Finds indices of samples less than or equal to the threshold
        left_index = np.argwhere(X_column <= split_threshold).flatten()

        # Finds indices of samples greater than the threshold
        right_index = np.argwhere(X_column > split_threshold).flatten()

        # Return indices of samples that goes to left or right
        return left_index, right_index

    def predict(self, X):

        # Return array of prediction for each data
        return np.array([self.traverse(x, self.root) for x in X])

    def traverse(self, X, node):

        # Check if current node is a leaf
        if node.leaf():

            # Return the class of single data
            return node.value

        # Decide to go left or right, feature to use and threshold to compare with
        if X[node.feature] <= node.threshold:

            # Traverse left
            return self.traverse(X, node.left)
        
        # Traverse right
        return self.traverse(X, node.right)