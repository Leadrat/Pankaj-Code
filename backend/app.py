from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.analyze import analyze_bp
from routes.predict_yield import predict_bp
from routes.recommend_fertilizer import recommend_bp
from routes.chatbot import chatbot_bp


def create_app():
    # Explicitly load .env from the backend folder to avoid CWD issues
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(dotenv_path=env_path, override=False)
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(analyze_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(recommend_bp)
    app.register_blueprint(chatbot_bp)

    @app.route("/api/health", methods=["GET"])  # simple healthcheck
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    # Bind to 0.0.0.0 for cross-origin local access, default port 5001
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
