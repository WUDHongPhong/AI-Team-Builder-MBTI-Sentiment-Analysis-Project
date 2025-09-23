# 🔮 AI Team Builder: Xây dựng đội nhóm thông minh từ MBTI

Một ứng dụng web sử dụng Trí tuệ nhân tạo (AI) để dự đoán tính cách MBTI từ văn bản, giúp xây dựng và phân tích các đội nhóm một cách thông minh, hiệu quả.

---

## 🧠 Các tính năng chính

- **Dự đoán MBTI cá nhân**: Nhập một đoạn văn bản (như mô tả bản thân, bài viết,...) để dự đoán loại tính cách MBTI của bạn.
- **Xây dựng & Phân tích đội nhóm**: Giao diện trực quan cho phép bạn thêm nhiều thành viên, dự đoán tính cách của từng người và phân tích sự đa dạng của cả đội.
- **Gợi ý vai trò cốt lõi**: Công cụ phân tích sự cân bằng trong nhóm và gợi ý các vai trò cốt lõi (Lãnh đạo, Sáng tạo, Hỗ trợ, Thực thi) mà đội nhóm có thể đang thiếu.
- **Thử nghiệm với dữ liệu có sẵn**: Cho phép người dùng kiểm tra hiệu suất của mô hình với các bộ dữ liệu đã được nạp sẵn.

---

## 🛠️ Công nghệ sử dụng

- **Backend**: Flask (Python)
- **AI Model**: Linear SVM và TF-IDF Vectorizer (Huấn luyện với `scikit-learn`)
- **Frontend**: HTML5, CSS3, JavaScript
- **Lập trình Notebook**: Jupyter Notebook
- **Thư viện**: `scikit-learn`, `joblib`, `flask`, `pandas`, `nltk`, `langdetect`, v.v.

---

## 📦 Hướng dẫn chạy dự án cục bộ (Local Development)

### Điều kiện tiên quyết

- Python 3.10+ (3.12.8)
- `pip` (Trình quản lý gói của Python)

### ⚙️ Cài đặt

1.  **Clone repository**
    ```bash
    git clone [URL_repo_của_bạn]
    cd AI_Team_Builder
    ```
2.  **Tạo và kích hoạt môi trường ảo**
    ```bash
    python -m venv venv
    ```
    -   **Trên Windows**
        ```bash
        .\venv\Scripts\activate
        ```
    -   **Trên macOS/Linux**
        ```bash
        source venv/bin/activate
        ```
3.  **Cài đặt các thư viện cần thiết**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Tải các mô hình đã huấn luyện**
    * Do kích thước lớn, các tệp mô hình `svm_model.pkl`, `tfidf_vectorizer.pkl` và `mbti_mapping.json` không được lưu trữ trực tiếp trên GitHub.
    * Vui lòng tải các tệp này từ đường link sau: **[Link Google Drive/Dropbox]**
    * Sau khi tải về, đặt chúng vào thư mục gốc của dự án (`/D:\MBTI\demo\backend/`).
### ▶️ Khởi chạy ứng dụng
Chạy lệnh sau trong terminal:
```python D:\MBTI\demo\backend\app.py```
Mở trình duyệt web của bạn và truy cập vào địa chỉ: http://127.0.0.1:5000
📁 Cấu trúc dự án
```
D:\
└── MBTI\
    ├── demo\
    │   ├── backend\
    │   │   └── app.py
    │   ├── data\
    │   │   ├── external_test_data.csv
    │   │   └── test.csv
    │   └── frontend\
    │       ├── static\
    │       │   └── script.js      # Script JavaScript
    │       └── templates\
    │           ├── index.html     # Giao diện chính
    │           └── style.css      # CSS cho giao diện
    ├── main\
    │   ├── reports\               # Báo cáo và các file liên quan
    │   │   ├── (các file .pdf, .csv, .png, .jpg)
    │   └── mbti-nlp-project.ipynb # Jupyter Notebook huấn luyện mô hình
    ├── README.md
    └── requirements.txt
```
## 📊 Chi tiết mô hình
**Kiến trúc:** Sử dụng phương pháp 4 phân loại nhị phân kết hợp với TF-IDF và mô hình Linear SVM từ thư viện scikit-learn.

**Đầu vào:** Văn bản tiếng Anh do người dùng nhập.

**Đầu ra:** Một chuỗi MBTI (ví dụ: INTJ) và một vector nhị phân tương ứng.

**Kết quả:**
- Báo cáo chỉ ra rằng mô hình TF-IDF + Linear SVM đạt Macro-F1 ≈ 84%.
- Trong khi đó, việc tinh chỉnh mô hình BERT đạt Macro-F1 ≈ 87%.

## 🔗 Liên kết
Notebook Huấn luyện Mô hình: https://www.kaggle.com/code/wudhgphong/mbti-nlp-project

Bộ dữ liệu: Kaggle: Myers-Briggs Personality Type Dataset
