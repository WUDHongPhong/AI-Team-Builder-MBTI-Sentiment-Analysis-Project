import os
import json
import joblib
import csv
import random
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

# --- Cấu hình đường dẫn động cho project ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT_DIR = os.path.normpath(os.path.join(BASE_DIR, '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT_DIR, 'frontend')

TEMPLATES_DIR = os.path.join(FRONTEND_DIR, 'templates')
STATIC_DIR = os.path.join(FRONTEND_DIR, 'static')

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)
CORS(app)

# --- Tải Model và các tệp cần thiết ---
try:
    model = joblib.load(os.path.join(BASE_DIR, "svm_model.pkl"))
    vectorizer = joblib.load(os.path.join(BASE_DIR, "tfidf_vectorizer.pkl"))
    with open(os.path.join(BASE_DIR, "mbti_mapping.json"), "r", encoding="utf-8") as f:
        raw_map = json.load(f)
    binary_to_mbti = {tuple(int(x) for x in entry["binary"]): entry["mbti"] for entry in raw_map.values()}
    print("✅ Tất cả các tệp model đã được tải thành công.")
except Exception as e:
    print(f"❌ LỖI khi tải tệp model: {e}")
    model, vectorizer, binary_to_mbti = None, None, {}

# --- Các hàm phụ trợ ---
def fallback_compose(y_arr):
    try:
        ie, sn, tf, jp = (int(x) for x in y_arr)
        return ("I" if ie else "E") + ("N" if sn else "S") + ("T" if tf else "F") + ("J" if jp else "P")
    except:
        return None

# ========== Các Route của ứng dụng ==========
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if not model or not vectorizer:
        return jsonify({"error": "Model không khả dụng"}), 503
    data = request.json
    text = data.get("text", "")
    if not text.strip():
        return jsonify({"error": "Văn bản đầu vào rỗng"}), 400
    try:
        vectorized_text = vectorizer.transform([text])
        prediction = model.predict(vectorized_text)
        binary_result = prediction[0].tolist()
        feature_names = vectorizer.get_feature_names_out()
        tfidf_scores = vectorized_text.toarray().flatten()
        top_indices = tfidf_scores.argsort()[-3:][::-1]
        influential_tokens = [feature_names[i] for i in top_indices if tfidf_scores[i] > 0]
        mbti_type = binary_to_mbti.get(tuple(binary_result), fallback_compose(binary_result))
        return jsonify({
            "mbti_type": mbti_type, "binary": binary_result,
            "influential_tokens": influential_tokens, "success": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- THÊM LẠI CÁC ROUTE ĐỂ LẤY DỮ LIỆU TEST ---
@app.route("/get_test_data")
def get_test_data():
    try:
        all_data = []
        file_path = r'D:\MBTI\demo\data\test.csv'
        
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ie = "I" if int(row["IE"]) == 1 else "E"
                sn = "N" if int(row["SN"]) == 1 else "S"
                tf = "T" if int(row["TF"]) == 1 else "F"
                jp = "J" if int(row["JP"]) == 1 else "P"
                mbti_original = ie + sn + tf + jp
                all_data.append({"text": row["text"], "original_mbti": mbti_original})

        sample_size = min(len(all_data), 4)
        random_data = random.sample(all_data, sample_size)
        return jsonify({"data": random_data})
    except FileNotFoundError:
        return jsonify({"error": f"Không tìm thấy tệp tại '{file_path}'. Hãy kiểm tra lại đường dẫn."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_external_data")
def get_external_data():
    try:
        all_data = []
        file_path = r'D:\MBTI\demo\data\external_test_data.csv'
        
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                all_data.append({"text": row["text"], "original_mbti": row["mbti"]})
        
        sample_size = min(len(all_data), 4)
        random_data = random.sample(all_data, sample_size)
        return jsonify({"data": random_data})
    except FileNotFoundError:
        return jsonify({"error": f"Không tìm thấy tệp tại '{file_path}'. Hãy kiểm tra lại đường dẫn."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)