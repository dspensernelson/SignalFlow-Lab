"""Check m5-3: chunking is stable, the index stores vectors in sqlite-vec,
and a known question returns the right chunk. A deterministic bag-of-words
embedder is injected so nothing is downloaded."""

from __future__ import annotations

import hashlib
import math
import re

from tools.rag import POLICIES_DIR, PolicyIndex, chunk_text, load_policies

DIM = 64
STOPWORDS = {"the", "and", "for", "that", "with", "from", "this", "are", "not", "does", "how", "can",
             "what", "must", "every", "about", "have", "has", "our", "their", "any", "all", "when", "who"}


def hashing_embedder(texts: list[str]) -> list[list[float]]:
    """Deterministic, model-free: content words (lightly stemmed) hashed into 64
    buckets, L2-normalized. Good enough to find a paragraph by its vocabulary."""
    out = []
    for text in texts:
        vec = [0.0] * DIM
        for word in re.findall(r"[a-z]+", text.lower()):
            if len(word) < 3 or word in STOPWORDS:
                continue
            word = word[:-1] if word.endswith("s") and len(word) > 4 else word
            h = int(hashlib.md5(word.encode()).hexdigest(), 16) % DIM
            vec[h] += 1.0
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        out.append([v / norm for v in vec])
    return out


def test_chunking_splits_paragraphs_and_long_ones():
    text = "First paragraph.\n\nSecond paragraph here.\n\n\n" + ("A sentence that is long enough. " * 40)
    chunks = chunk_text("doc", text, max_chars=500)
    assert [c.id for c in chunks][:2] == ["doc#0", "doc#1"]
    assert chunks[0].text == "First paragraph." and chunks[1].text == "Second paragraph here."
    assert len(chunks) >= 4 and all(len(c.text) <= 500 for c in chunks)
    assert all(c.doc_id == "doc" for c in chunks)
    assert chunk_text("doc", text, max_chars=500) == chunks, "chunk ids must be stable"


def test_policies_load():
    docs = load_policies(POLICIES_DIR)
    assert {d for d, _ in docs} == {"gift-acceptance", "refunds", "receipt-wording"}


def test_index_and_search_known_questions(tmp_path):
    index = PolicyIndex(tmp_path / "policy.db", embedder=hashing_embedder, dim=DIM)
    n = index.index_documents(load_policies(POLICIES_DIR))
    assert n >= 10

    hits = index.search("Can we accept a donated car or vehicle?", k=3)
    assert hits and hits[0].doc_id == "gift-acceptance" and "vehicle" in hits[0].text.lower()
    assert hits == sorted(hits, key=lambda h: h.distance)

    hits = index.search("Within how many days must a refund request arrive?", k=2)
    assert hits[0].doc_id == "refunds" and "60 days" in hits[0].text

    hits = index.search("What must every receipt state about goods or services?", k=2)
    assert hits[0].doc_id == "receipt-wording"


def test_reindex_replaces_a_document(tmp_path):
    index = PolicyIndex(tmp_path / "policy.db", embedder=hashing_embedder, dim=DIM)
    index.index_documents([("a", "Alpha paragraph about apples."), ("b", "Beta paragraph about boats.")])
    index.index_documents([("a", "Alpha paragraph about apricots only.")])
    hits = index.search("apples apricots alpha", k=5)
    a_hits = [h for h in hits if h.doc_id == "a"]
    assert len(a_hits) == 1 and "apricots" in a_hits[0].text
