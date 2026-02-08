# Chatbot Architecture Documentation

## Overview

This document explains how the AI-powered chatbot system works, including PDF upload, processing using OpenAI LLM, storage in ChromaDB, and retrieval logic.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [PDF Upload Process](#pdf-upload-process)
3. [PDF Processing with OpenAI](#pdf-processing-with-openai)
4. [ChromaDB Storage](#chromadb-storage)
5. [Query Processing & Retrieval](#query-processing--retrieval)
6. [Flow Diagrams](#flow-diagrams)

---

## System Architecture

The chatbot system uses a **Retrieval-Augmented Generation (RAG)** architecture:

- **Document Storage**: PDFs are stored in AWS S3
- **Vector Database**: ChromaDB stores document embeddings
- **LLM**: OpenAI GPT-3.5-turbo or Google Gemini for generating responses
- **Embeddings**: OpenAI `text-embedding-3-large` model for vector embeddings

### Key Components

- **ChromaDB Collections**:
  - `document_embeddings_openAI`: Stores PDF/document embeddings
  - `tabular_data_embedding`: Stores CSV/Excel data embeddings
  - `user_answered_knowledge`: Stores user-answered knowledge base

---

## PDF Upload Process


## Flow Diagrams

### PDF Upload & Processing Flow

```mermaid
graph TD
    A[User Uploads PDF] --> B[POST /v1/ai/add-document]
    B --> C[File Saved to Disk]
    C --> D[Upload to S3]
    D --> E[Get ChromaDB Collection]
    E --> F[Start Async Processing]
    F --> G[Read PDF Buffer]
    G --> H[Convert PDF to Markdown]
    H --> I[Process Markdown to Chunks]
    I --> J[Extract Hierarchical Headings]
    J --> K[Create Chunks with Metadata]
    K --> L[Split into Batches]
    L --> M[Generate Embeddings via OpenAI API]
    M --> N[Store in ChromaDB]
    N --> O[Update Database Record]
    
    style A fill:#e1f5ff
    style D fill:#fff4e1
    style M fill:#ffe1f5
    style N fill:#e1ffe1
```

### Query Processing Flow

```mermaid
graph TD
    A[User Sends Message] --> B[POST /v1/ai/chat]
    B --> C[Check Usage Limits]
    C --> D[Load Conversation History]
    D --> E[Classify Intent]
    E --> F{Intent Type?}
    
    F -->|greeting| G[Generate Greeting Response]
    F -->|general| H[Contextual Response]
    F -->|knowledge| I[Extract Countries]
    F -->|course-enquiry| J[Check Feature Flag]
    
    I --> K[Generate Query Embedding]
    K --> L[Search ChromaDB]
    L --> M[Filter by Country]
    M --> N[Filter by Distance]
    N --> O[Optional Reranking]
    O --> P[Retrieve Tabular Data]
    P --> Q[Retrieve User Knowledge]
    Q --> R[Build System Prompt]
    R --> S[Generate LLM Response]
    S --> T[Save to Database]
    T --> U[Update Redis Cache]
    U --> V[Return Response]
    
    style A fill:#e1f5ff
    style K fill:#ffe1f5
    style L fill:#e1ffe1
    style S fill:#fff4e1
```

### ChromaDB Storage Flow

```mermaid
graph LR
    A[PDF Chunks] --> B[Batch Processing]
    B --> C[OpenAI Embedding API]
    C --> D[Vector Embeddings]
    D --> E[ChromaDB Collection]
    E --> F[Metadata Storage]
    
    G[Query Text] --> H[Query Embedding]
    H --> I[Vector Similarity Search]
    I --> E
    E --> J[Retrieved Chunks]
    
    style C fill:#ffe1f5
    style E fill:#e1ffe1
    style I fill:#e1f5ff
```

### Document Chunking Structure

```mermaid
graph TD
    A[PDF Document] --> B[Convert to Markdown]
    B --> C[Parse Headings]
    C --> D{Heading Level?}
    
    D -->|H1| E[Main Section Chunk]
    D -->|H2| F[Subsection Chunk]
    D -->|H3| G[Sub-subsection Chunk]
    D -->|H4| H[Detail Chunk]
    
    E --> I[Content + H1 Context]
    F --> J[Content + H1 + H2 Context]
    G --> K[Content + H1 + H2 + H3 Context]
    H --> L[Content + Full Hierarchy]
    
    I --> M[Generate Embedding]
    J --> M
    K --> M
    L --> M
    
    M --> N[Store in ChromaDB]
    
    style A fill:#e1f5ff
    style M fill:#ffe1f5
    style N fill:#e1ffe1
```

## Summary

The chatbot system follows a **RAG (Retrieval-Augmented Generation)** architecture:

1. **Upload**: PDFs uploaded to S3 and processed asynchronously
2. **Processing**: PDFs converted to Markdown, chunked hierarchically, and embedded using OpenAI
3. **Storage**: Embeddings stored in ChromaDB with metadata (filename, country, headings)
4. **Retrieval**: User queries embedded and searched in ChromaDB using vector similarity
5. **Generation**: Retrieved context combined with LLM to generate accurate responses

The system handles large documents efficiently through batch processing and maintains document structure through hierarchical chunking.

