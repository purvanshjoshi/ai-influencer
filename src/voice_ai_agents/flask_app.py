"""
Flask Application - Voice AI Agents Service
Bridges Python voice agents to Node.js/Express backend
Supports: Audio Tour, Customer Support, Voice RAG agents
"""

from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Express backend communication

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# Register error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'status': 'error', 'message': 'Bad request', 'details': str(error)}), 400

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal server error: {error}')
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'voice-ai-agents',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200

# Blueprint for audio tour agent
from routes.audio_tour_routes import audio_tour_bp
app.register_blueprint(audio_tour_bp, url_prefix='/api/voice/audio-tour')

# Blueprint for customer support agent
from routes.customer_support_routes import customer_support_bp
app.register_blueprint(customer_support_bp, url_prefix='/api/voice/customer-support')

# Blueprint for voice RAG agent
from routes.voice_rag_routes import voice_rag_bp
app.register_blueprint(voice_rag_bp, url_prefix='/api/voice/rag')

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'Voice AI Agents API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'audio_tour': '/api/voice/audio-tour',
            'customer_support': '/api/voice/customer-support',
            'voice_rag': '/api/voice/rag'
        }
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
