"""Lesson m5-3: the smallest viable RAG over the pantry's policy documents.

When staff ask "can we accept a donated car?" the answer lives in prose
nobody indexed. Chunk the documents, embed each chunk, store the vectors in
SQLite (the sqlite-vec extension), and search by meaning. That is the whole
of retrieval-augmented generation at this size; everything bigger is
tuning.

Embeddings: ``fastembed`` runs a small ONNX model on CPU with no GPU and no
key (``BAAI/bge-small-en-v1.5``, ~70 MB downloaded once). The embedder is
injectable so the check runs with a deterministic stand-in and never
downloads anything; run the real model by hand.

Spec (the check asserts this):

- ``chunk_text(doc_id, text, max_chars=500) -> list[Chunk]`` splits on blank
  lines (paragraphs); a paragraph longer than ``max_chars`` is split at
  sentence ends (". ") into pieces no longer than ``max_chars``; chunk ids
  are ``f"{doc_id}#{n}"`` numbered from 0; empty paragraphs are dropped.
- ``Chunk`` is a pydantic model: ``id``, ``doc_id``, ``text``.
- ``Embedder = Callable[[list[str]], list[list[float]]]``; ``default_embedder()``
  returns one backed by fastembed (imported lazily).
- ``PolicyIndex(db_path, embedder=None, dim=None)``: loads sqlite-vec,
  creates ``chunks`` (id TEXT primary key, doc_id TEXT, text TEXT) and a
  ``vec0`` virtual table ``chunk_vectors(embedding float[dim])`` keyed by
  rowid, with the rowid mirrored in ``chunks.rowid``. ``dim`` is taken from
  the first embedding when None.
- ``index_documents(docs: list[tuple[str, str]]) -> int`` chunks, embeds,
  stores; returns the chunk count. Re-indexing a doc_id replaces its chunks.
- ``search(query, k=3) -> list[SearchHit]`` where ``SearchHit`` has
  ``chunk_id, doc_id, text, distance`` (smaller is closer), ordered by
  distance.
- ``load_policies(folder) -> list[tuple[str, str]]`` reads ``*.md`` files
  (doc_id = file stem).

Wiring: an MCP tool ``search_policy(question: str) -> {"hits": [...]}``
(requires donors:read) backed by an index built at startup from
``middleware/policies/``.
"""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from pydantic import BaseModel

POLICIES_DIR = Path(__file__).resolve().parents[1] / "policies"

Embedder = Callable[[list[str]], list[list[float]]]


class Chunk(BaseModel):
    id: str
    doc_id: str
    text: str


class SearchHit(BaseModel):
    chunk_id: str
    doc_id: str
    text: str
    distance: float


def chunk_text(doc_id: str, text: str, max_chars: int = 500) -> list[Chunk]:
    raise NotImplementedError("Lesson m5-3: implement chunk_text in tools/rag.py")


def default_embedder(model_name: str = "BAAI/bge-small-en-v1.5") -> Embedder:
    """fastembed-backed embedder (lazy import so the check never needs the model)."""
    raise NotImplementedError("Lesson m5-3: implement default_embedder in tools/rag.py")


def load_policies(folder: str | Path = POLICIES_DIR) -> list[tuple[str, str]]:
    raise NotImplementedError("Lesson m5-3: implement load_policies in tools/rag.py")


class PolicyIndex:
    def __init__(self, db_path: str | Path, embedder: Embedder | None = None, dim: int | None = None):
        self.db_path = str(db_path)
        self.embedder = embedder
        self.dim = dim
        raise NotImplementedError("Lesson m5-3: implement PolicyIndex.__init__ (load sqlite-vec, create tables)")

    def index_documents(self, docs: list[tuple[str, str]]) -> int:
        raise NotImplementedError("Lesson m5-3: implement PolicyIndex.index_documents")

    def search(self, query: str, k: int = 3) -> list[SearchHit]:
        raise NotImplementedError("Lesson m5-3: implement PolicyIndex.search")
