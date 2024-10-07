import pickle
import numpy as np
from urllib.parse import urlparse
from gensim.models import Word2Vec

# Embedding generation using pretrained models
def generate_embeddings(tokens, model):
    embeddings = [model.wv[token] for token in tokens if token in model.wv]
    if embeddings:
        return np.mean(embeddings, axis=0)
    else:
        return np.zeros(model.vector_size)

# Extract features from url
def extract_features(url):
    
    # Load necessary models for feature extraction
    domain_model = Word2Vec.load('smellsphishy_domain.model')
    path_model = Word2Vec.load('smellsphishy_path.model')

    # Parse url
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    path = parsed_url.path.strip('/').split('/') if parsed_url.path else []
    query = parsed_url.query

    # Basic url features
    url_length = len(url)
    domain_length = len(domain)
    domain_tokens = len(domain.split('.'))
    path_length = len('/'.join(path)) if path else 0
    query_length = len(query)
    num_dots = domain.count('.')
    num_hyphens = domain.count('-')
    num_special_chars = sum([c in '@!#$%^&*()' for c in domain + '/'.join(path)])
    num_digits = sum([c.isdigit() for c in domain + '/'.join(path)])
    num_subdirectories = len(path)
    num_query_params = len(query.split('&')) if query else 0

    # Keyword based feature
    suspicious_keywords = [
    'secure', 'verify', 'update', 'confirm', 'validate', 'auth', 'unlock', 'suspended', 'blocked',
    'renew', 'password', 'credentials', 'id', 'access', 'support', 'signin', 'activate', 'alert',
    'warning', 'recovery', 'banking', 'banned', 'upgrade', 'checkout']
    has_suspicious_keywords = int(any(keyword in url for keyword in suspicious_keywords))

    # Domain and path embeddings
    domain_tokens_list = domain.split('.')
    domain_embedding = generate_embeddings(domain_tokens_list, domain_model)
    path_embedding = generate_embeddings(path, path_model)

    # Combine basic features and embeddings
    feature_vector = np.array([
        url_length, domain_length, domain_tokens, path_length, num_dots, num_hyphens,
        num_special_chars, num_digits, num_subdirectories, query_length,
        num_query_params, has_suspicious_keywords
    ])

    # Concatenate all features
    combined_features = np.concatenate([feature_vector, domain_embedding, path_embedding])

    # Return features
    return combined_features

# Check and classify the url
def checkURLInput(url):

    # Load the trained model
    with open('smellsphishy_main_model.pkl', 'rb') as f:
        rf_model = pickle.load(f)

    # Extract features from the URL
    features = extract_features(url)

    # Reshape features for the model
    features = features.reshape(1, -1)

    # Predict using the Random Forest model
    tree_predictions, final_predictions = rf_model.predict(features)

    # Return the result
    return final_predictions