---
tags: [rag, multimodal, vision, embeddings, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2x06/multimodal-rag
---

## Pre-test

1. How does a multimodal embedding model differ from a standard text embedding model, and what property must it preserve across different data modalities?
2. What is the "PDF RAG" grid-splitting approach, and how does its retrieval scoring mechanism resemble a method used in text retrieval?
3. What practical advantage does treating slides and PDFs as image files provide for a RAG knowledge base, and what challenge does it introduce?

---

# Lecture 066: Multimodal RAG

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2x06/multimodal-rag

## Outline

1. [Beyond Text: Why Multimodal RAG Matters](#beyond-text-why-multimodal-rag-matters)
2. [Multimodal Embedding Models and Shared Vector Spaces](#multimodal-embedding-models-and-shared-vector-spaces)
3. [Retrieval in a Multimodal Vector Store](#retrieval-in-a-multimodal-vector-store)
4. [Language Vision Models: Processing Images as Tokens](#language-vision-models-processing-images-as-tokens)
5. [Chunking Images: From Semantic Segmentation to PDF RAG](#chunking-images-from-semantic-segmentation-to-pdf-rag)
6. [Current State and Practical Considerations](#current-state-and-practical-considerations)

---

## Beyond Text: Why Multimodal RAG Matters

Throughout this course, the knowledge base has been treated as a collection of text documents. Yet the information organizations actually need to surface — product specifications, research findings, financial analyses, training materials — is rarely stored in plain text alone. Slide decks, PDFs, scanned reports, and web pages all interweave prose, charts, tables, diagrams, and photographs into a single artifact. A RAG system that can only ingest text is forced to either discard the visual components entirely or rely on brittle pre-processing pipelines to convert everything into strings before indexing. Either path leaves value on the table.

Multimodal RAG is the architectural response to this reality. A multimodal model is one designed from the ground up to handle multiple data types — most commonly text and images, though audio and video are also increasingly viable. A multimodal RAG system extends the standard pipeline in two directions: the knowledge base now stores both text chunks and image files, and the system can accept queries that include images as well as natural-language questions. The generated response is still text, because that is how users consume answers, but the evidence drawn on during generation may come from any modality in the index.

Making this work requires updates to both of the core RAG components: the retriever must become multimodal so it can compare queries against images and text in the same ranked list, and the LLM must become a language vision model so it can reason over whichever combination of retrieved items the retriever returns. Neither component can be upgraded in isolation — a multimodal embedding model paired with a text-only LLM would retrieve images it cannot then read, while a vision LLM paired with a text-only retriever would never receive images to reason about in the first place.

---

## Multimodal Embedding Models and Shared Vector Spaces

The retriever in a standard RAG system depends on an embedding model that maps text into a dense vector space where semantic proximity corresponds to geometric proximity — see [[019-semantic-search-introduction]] and [[020-semantic-search-embedding-model-deepdive]] for a detailed treatment of how these models work and what they learn. A multimodal embedding model extends exactly this idea: it maps multiple types of input into the *same* vector space, so that a text string and an image can be compared directly via dot product or cosine similarity.

The fundamental requirement is that the shared vector space must preserve semantic meaning across modalities. If you embed the word "dog" and the word "puppy" with a text-only model you expect their vectors to sit close together because the words are semantically related. A multimodal embedding model must satisfy an additional, harder constraint: a photograph of a dog must also land in roughly the same neighbourhood as both of those text tokens. The model cannot rely on surface-level string matching; it must have learned a modality-agnostic notion of meaning. Training typically involves contrastive objectives over large paired datasets of images and their captions, encouraging the model to place a caption's embedding near its corresponding image's embedding while pushing unrelated image-caption pairs apart.

This shared space is what makes cross-modal retrieval possible. A user who types a text question can retrieve the most semantically relevant pages from a PDF — pages that may contain mostly charts with only a caption's worth of text — because both the question and the page land in the same vector space and can be ranked by the same nearest-neighbour lookup used in purely text-based retrieval. The [[030-vector-databases]] lesson discussed how approximate nearest-neighbour indices scale this lookup efficiently; none of that infrastructure changes when the items being indexed include images.

---

## Retrieval in a Multimodal Vector Store

Once a multimodal embedding model is in place, the mechanics of retrieval are reassuringly familiar. At index time, every item in the knowledge base — whether it is a text chunk or an image — is passed through the multimodal embedding model to produce a dense vector, and that vector is stored in the vector database alongside a reference to the original content. The database ends up holding a mixed collection of text vectors and image vectors, all in the same latent space.

At query time, the incoming prompt — again, whether text or image — is embedded by the same multimodal model, producing a query vector. Standard vector search then proceeds exactly as described in [[019-semantic-search-introduction]]: the system finds the items whose vectors are closest to the query vector, ranks them, and returns the top-k results. Those results may be text chunks, image files, or a combination; the retriever treats them identically because they all exist as numeric vectors in the same space.

The augmented prompt that goes to the language model then contains the original query together with whichever retrieved items scored highest. If some of those items are images, they must be passed to a model capable of processing images — which is precisely what the next section addresses. Importantly, the retrieval step itself requires no special treatment of mixed-modality results; the ranking logic is the same dot-product or cosine comparison that text-only RAG has always used.

---

## Language Vision Models: Processing Images as Tokens

A language vision model — sometimes called a vision-language model or LVM — extends a standard large language model with the ability to process images alongside text. The mechanism mirrors how text is handled: just as a text tokenizer breaks a sentence into a sequence of token IDs, an image tokenizer breaks an image into a grid of rectangular patches, each of which is represented as a learned token embedding. Depending on the resolution of the image, the number of tokens it produces spans a wide range: low-resolution representations might require around 100 tokens, while high-resolution versions of the same image might require approaching 1,000.

Once the image is tokenized, the resulting sequence of patch embeddings is concatenated with the text token embeddings in the prompt and passed through the transformer architecture of the LLM. The attention mechanism in the transformer is inherently sequence-agnostic — it does not fundamentally care whether a token came from text or an image patch — so the model can develop integrated attention patterns that relate a word in the question to a region in a retrieved chart. The output is still a text sequence generated autoregressively, exactly as in a standard LLM.

The practical implication is that the context window budget must account for image tokens as well as text tokens. A retrieved page that requires 512 image tokens contributes to the context limit just as a 512-token text passage would. For RAG systems retrieving multiple pages or images, this can push against context limits quickly, reinforcing the importance of chunking strategies discussed in [[032-chunking]] and retrieval precision techniques such as re-ranking covered in [[036-cross-encoders-and-colbert]].

---

## Chunking Images: From Semantic Segmentation to PDF RAG

Treating pages of slides and PDFs as images is an attractive simplification: the conversion is straightforward, the output format is uniform, and it sidesteps complex document-parsing pipelines. The catch is that a single page is often extraordinarily information-dense. A single slide might contain a title, several bullet points, a bar chart, an inset photograph, and a footnote. A single PDF page might contain a data table, two paragraphs of analysis, and a figure with a multi-line caption. Embedding the entire page as one image produces a single vector that blurs all of that content together, which hurts retrieval precision for the same reason that chunking entire chapters as a single text unit hurts recall — see [[032-chunking]] for the parallel argument in the text domain.

The earlier generation of solutions to this problem attempted sophisticated layout analysis: detecting bounding boxes for each logical element on the page, classifying each box as text, chart, image, or table, and then embedding each element independently. In practice these approaches remained error-prone. Table boundaries are often ambiguous, multi-column layouts confuse segmentation algorithms, and charts with embedded legends or callouts resist clean separation from their surrounding context. The classification step added latency and a new failure mode without fully solving the underlying problem.

A newer approach, often called "PDF RAG," sidesteps the classification problem entirely by adopting a fixed-grid strategy. Every page is divided into a regular grid of equal-sized squares — without any attempt to align grid boundaries to semantic content — and each square is independently embedded by the multimodal model. Retrieval then operates over this pool of square-level embeddings using a scoring strategy closely analogous to ColBERT, the late-interaction model described in [[036-cross-encoders-and-colbert]]. Rather than computing a single score for the whole page, each token in the query finds its best-matching square on the candidate page, and these individual best-match scores are summed to produce an overall page relevance score. This late-interaction approach is flexible, tolerant of the arbitrary grid boundaries, and empirically competitive on document retrieval benchmarks.

The trade-off is storage. Splitting every page into a dense grid multiplies the number of vectors per document substantially. A ten-page PDF that would generate ten page-level vectors might instead generate hundreds of grid-square vectors. At scale, across a large knowledge base, this puts real pressure on the vector database's storage capacity and index size — a concern that connects directly to the cost and scalability discussions in [[063-cost-vs-response-quality]] and [[064-latency-vs-response-quality]].

---

## Current State and Practical Considerations

Multimodal RAG is genuinely cutting-edge technology. The core components are available and functional, but the ecosystem has not yet settled into the kind of stable, well-documented patterns that text-only RAG enjoys. Most major LLM providers now offer a language vision model, so the generation half of a multimodal pipeline is relatively accessible. Multimodal embedding models are more experimental: the range of available options is smaller, benchmarks are less mature, and best practices for fine-tuning or domain adaptation are still being established.

For practitioners building production systems, this means a few things. First, model selection for the embedding layer deserves careful evaluation rather than defaulting to the first available option — the quality of the shared vector space directly determines retrieval quality, and different models have meaningfully different strengths on different types of images. Second, the grid-based PDF RAG approach, while promising, requires thoughtful capacity planning in the vector database layer; the storage expansion factor should be estimated for your actual document corpus before committing to the approach. Third, because the field is moving quickly, a multimodal RAG design should be built with modular boundaries — using the same component-substitution principles that the rest of this module has recommended — so that the embedding model or vision LLM can be swapped as better options emerge without requiring a full system redesign.

The broader trajectory is clear: as information retrieval increasingly demands reasoning over mixed-format content, multimodal RAG closes a gap that text-only RAG fundamentally cannot address. The foundational ideas — shared vector spaces, image tokenization, late-interaction scoring — are stable enough to build on today, even if the specific implementations will continue to improve.

---

## Post-test

1. A user uploads a 50-page financial report in PDF format and asks a question about a specific bar chart on page 34. Describe the end-to-end flow a multimodal RAG system would follow to retrieve the relevant content and generate an answer, naming each component involved.
2. Compare the semantic-segmentation approach to PDF chunking with the fixed-grid (PDF RAG) approach: what problem does each solve, what failure mode does each introduce, and when might you prefer one over the other?
3. Explain why storing images in a multimodal vector database requires the same embedding model at both index time and query time, and what would break if you used different multimodal models for each step.

> [!example]- Answer Guide
> 
> #### Q1 — Multimodal RAG End-to-End Flow
> 
> The PDF is converted to per-page images at ingestion time. Each page is chunked (e.g., by fixed grid or segmentation) and each chunk is passed through a multimodal embedding model to produce a dense vector stored in the vector database. At query time the user's text question is embedded by the same multimodal model. Vector search finds the top-k image chunks whose vectors are nearest to the query vector — ideally including squares from page 34 that cover the bar chart. The retrieved image patches plus the original query are passed as a combined prompt to a language vision model, which tokenizes the image patches into patch tokens, concatenates them with the text tokens, runs them through a transformer, and generates a text answer referencing the chart's data.
> 
> #### Q2 — Semantic Segmentation vs Fixed-Grid Chunking
> 
> Semantic segmentation attempts to detect and classify each logical element on a page (text block, chart, image, table), embedding each element as a distinct unit. It produces semantically meaningful chunks but is error-prone — misclassification and ambiguous boundaries are common failure modes. Fixed-grid splitting divides every page into uniform squares without classification, which is robust and fast but may cut across logical elements, mixing parts of a chart with parts of adjacent text in a single square. Semantic segmentation is preferable when layout is structured and predictable (e.g., templated corporate reports); fixed-grid is preferable when documents are diverse, poorly structured, or when operational simplicity and retrieval robustness outweigh chunk purity.
> 
> #### Q3 — Same Embedding Model at Index and Query
> 
> A vector space is defined by the model that produces it — two different models, even if both described as "multimodal," project inputs into different latent spaces with different geometric relationships. If index-time vectors are produced by model A and query-time vectors by model B, the cosine similarity between a query vector and a document vector is meaningless because the two vectors live in incompatible spaces. Retrieval would return effectively random results. Using the same model end-to-end guarantees that the distance metric is consistent across the full pipeline.
