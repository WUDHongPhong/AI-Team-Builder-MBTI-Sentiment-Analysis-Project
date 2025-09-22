# preprocess_eda.py
# Python 3.10+ script to run EDA for MBTI dataset
import re
import json
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# --- Config ---
RAW_CSV = Path("D:/MBTI/data/mbti_1.csv")   # change if needed
OUT_ROOT = Path("D:/MBTI")
REPORTS = OUT_ROOT / "reports"
DATA_OUT = OUT_ROOT / "preprocessed_data"
RANDOM_SEED = 42

for d in [OUT_ROOT, REPORTS, DATA_OUT]:
    d.mkdir(parents=True, exist_ok=True)

# --- Load ---
if not RAW_CSV.exists():
    raise FileNotFoundError(f"Dataset not found at {RAW_CSV}.")
df = pd.read_csv(RAW_CSV)
print("Loaded:", RAW_CSV, "shape:", df.shape)
print("Columns:", df.columns.tolist())
print()

# ==========================================
# 1. DATA QUALITY CHECKS
# ==========================================
print("\n=== DATA QUALITY CHECKS ===")

# Missing values
missing_counts = df.isna().sum()
if missing_counts.any():
    print("🔴 Missing values per column:")
    print(missing_counts[missing_counts > 0])
else:
    print("✅ No missing values.")

# Duplicate rows
dup_full = df.duplicated().sum()
print(f"Duplicate full rows: {dup_full}")
if 'posts' in df.columns:
    dup_posts = df['posts'].duplicated().sum()
    print(f"Duplicate 'posts' content: {dup_posts}")

# Language check (optional)
try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = RANDOM_SEED

    sample = df['posts'].dropna().sample(min(50, len(df)), random_state=RANDOM_SEED)
    non_english = []
    for t in sample:
        try:
            if detect(str(t)) != "en":  # dataset MBTI gốc là tiếng Anh
                non_english.append(t)
        except:
            non_english.append(t)
    if non_english:
        print(f"⚠️ Found {len(non_english)} non-English samples in a sample of 50.")
    else:
        print("✅ All sample posts are detected as English.")
except ImportError:
    print("⚠️ langdetect not installed, skipping language check.")

print("=== DONE QUALITY CHECKS ===\n")

# ==========================================
# 2. FEATURE ENGINEERING (text-based stats)
# ==========================================
if 'text' not in df.columns:
    if 'posts' in df.columns:
        df['text'] = df['posts'].astype(str)
    else:
        raise ValueError("Input CSV must include 'posts' or 'text' column")

# --- Post count ---
def count_posts_field(s):
    s = str(s)
    return s.count('|||') + 1 if s.strip() != '' else 0

df['post_count'] = df['posts'].apply(count_posts_field)

# --- Length & punctuation / URL / emoji counts ---
df['text_len_chars'] = df['text'].astype(str).apply(len)
df['text_len_words'] = df['text'].astype(str).apply(lambda s: len(str(s).split()))

url_re = re.compile(r'http\S+|www\.\S+')
df['n_urls'] = df['text'].astype(str).apply(lambda s: len(url_re.findall(s)))
df['n_q'] = df['text'].astype(str).apply(lambda s: s.count('?'))
df['n_excl'] = df['text'].astype(str).apply(lambda s: s.count('!'))
df['n_nonascii_chars'] = df['text'].astype(str).apply(lambda s: sum(1 for ch in s if ord(ch) > 127))
df['frac_ascii_chars'] = df['text'].astype(str).apply(lambda s: sum(1 for ch in s if ord(ch) < 128) / max(1, len(s)))

# ==========================================
# 3. MBTI axes extraction (IE, SN, TF, JP)
# ==========================================
if 'type' not in df.columns:
    raise ValueError("Input CSV must contain 'type' column with MBTI labels (e.g. INTP)")

def axes_from_type(t):
    s = str(t).strip().upper()
    s = (s + "XXXX")[:4]
    return pd.Series({
        'IE': 1 if s[0] == 'I' else 0,
        'SN': 1 if s[1] == 'N' else 0,
        'TF': 1 if s[2] == 'T' else 0,
        'JP': 1 if s[3] == 'J' else 0
    })

axes_df = df['type'].apply(axes_from_type)
df = pd.concat([df, axes_df], axis=1)

# ==========================================
# 4. Distributions & summary stats
# ==========================================
type_counts = df['type'].value_counts().sort_values(ascending=False)
axis_counts = {
    'I': int(df['IE'].sum()),
    'E': int((df['IE'] == 0).sum()),
    'N': int(df['SN'].sum()),
    'S': int((df['SN'] == 0).sum()),
    'T': int(df['TF'].sum()),
    'F': int((df['TF'] == 0).sum()),
    'J': int(df['JP'].sum()),
    'P': int((df['JP'] == 0).sum())
}

summary = {
    "n_samples": int(len(df)),
    "unique_mbti_types": int(df['type'].nunique()),
    "top_mbti_counts": type_counts.head(12).to_dict(),
    "axis_counts": axis_counts,
    "text_len_chars_mean": float(df['text_len_chars'].mean()),
    "text_len_chars_median": float(df['text_len_chars'].median()),
    "text_len_words_mean": float(df['text_len_words'].mean()),
    "text_len_words_median": float(df['text_len_words'].median()),
    "avg_urls_per_user": float(df['n_urls'].mean()),
    "avg_questions_per_user": float(df['n_q'].mean()),
    "avg_exclaims_per_user": float(df['n_excl'].mean()),
    "avg_nonascii_per_user": float(df['n_nonascii_chars'].mean()),
    "avg_frac_ascii": float(df['frac_ascii_chars'].mean())
}
print(json.dumps(summary, indent=2))

# --- Save EDA table summary CSV ---
eda_table = df[['type','post_count','text_len_chars','text_len_words','n_urls','n_q','n_excl','n_nonascii_chars','frac_ascii_chars']].copy()
eda_table.to_csv(REPORTS / "eda_table_summary.csv", index=False)

# ==========================================
# 5. Plots
# ==========================================
plt.figure(figsize=(12,5))
type_counts.plot(kind='bar')
plt.title("MBTI 16-class distribution")
plt.xlabel("MBTI type")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig(REPORTS / "mbti_type_dist.png")
plt.close()

plt.figure(figsize=(7,3))
keys = ['I','E','N','S','T','F','J','P']
vals = [axis_counts[k] for k in keys]
plt.bar(keys, vals)
plt.title("MBTI axis distribution (counts)")
plt.tight_layout()
plt.savefig(REPORTS / "mbti_axis_dist.png")
plt.close()

plt.figure(figsize=(6,3))
plt.hist(df['text_len_words'].clip(upper=400), bins=50)
plt.title("Distribution of total words per user (clipped at 400)")
plt.xlabel("words")
plt.ylabel("count")
plt.tight_layout()
plt.savefig(REPORTS / "text_length_hist.png")
plt.close()

# ==========================================
# 6. Mask sample text and save
# ==========================================
def mask_pii(text, char_limit=800):
    if pd.isnull(text):
        return ""
    t = re.sub(r'http\S+|www\.\S+|\.com\S+|\S+@\S+', '<PII>', str(text))
    return t[:char_limit].replace('\n', ' ')

sample_masked = df.sample(4, random_state=RANDOM_SEED)[['type','text']].copy()
sample_masked['masked'] = sample_masked['text'].apply(mask_pii)
sample_masked.to_csv(REPORTS / "sample_masked_examples.csv", index=False)

print("\nMasked sample posts (first 2):")
for i, row in sample_masked.head(2).iterrows():
    print(f"[{row['type']}] {row['masked'][:400]}\n")

print("EDA CSV and plots saved to:", REPORTS)
print("Done.")
