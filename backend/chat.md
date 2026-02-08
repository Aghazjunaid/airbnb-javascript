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

### 1. API Endpoint

**Route**: `POST /v1/ai/add-document`

**Controller**: `chatbot-controller.js` → `addDocumentToVectorDbAndS3()`

### 2. Upload Flow

```javascript
// From chatbot-controller.js
addDocumentToVectorDbAndS3() {
  return async (req, res) => {
    uploadDisk(req, res, async (err) => {
      // File is uploaded to disk temporarily
      // Then processed and stored
    });
  };
}
```

### 3. Service Layer Processing

**File**: `chatbot-service.js` → `addDocumentToVectorDBAndS3()`

```javascript
exports.addDocumentToVectorDBAndS3 = async (req) => {
  let { country, recordId } = req?.body;
  
  // Step 1: Upload to S3
  const s3Service = new S3Service(Config.aws);
  let fileName = `ChatBotDocuments/${country}/` + req?.file?.originalname;
  let bucket = Config?.aws_buckets?.courseFinderDocumentsBucket;
  const fileBuffer = await fs.promises.readFile(req?.file?.path);
  
  await s3Service.putObjectBuffer(
    bucket,
    fileName,
    fileBuffer,
    { ContentType: req?.file?.mimetype }
  );
  
  // Step 2: Get ChromaDB collection
  const collection = await getOrCreateCollection({ 
    collectionName: EMBEDDING_MODELS.DOCUMENT_DATA_COLLECTION_NAME
  });
  
  // Step 3: Process file asynchronously
  this.processFile(req.file.path, req?.file?.originalname, country, collection)
    .then(async () => {
      // Update database record
      await sequelize.query(`
        UPDATE ChatbotDocuments
        SET IsProcessed = 1
        WHERE Id = ${recordId}
      `);
    });
  
  return 'File processing started!';
};
```

**Key Steps**:
1. File uploaded to temporary disk storage
2. File uploaded to S3 at path: `ChatBotDocuments/{country}/{filename}`
3. File processing started asynchronously (doesn't block response)
4. Database record updated when processing completes

---

## PDF Processing with OpenAI

### 1. PDF to Markdown Conversion

**File**: `common-service.js` → `processPdfToChunks()`

```javascript
exports.processPdfToChunks = async (pdfPath, country) => {
  // Read PDF file into buffer
  const pdfBuffer = await fs.readFile(pdfPath);
  
  // Convert PDF to Markdown using @opendocsg/pdf2md
  const markdownContent = await pdf2md(pdfBuffer);
  
  // Process markdown into hierarchical chunks
  return this.processMarkdownToChunks(markdownContent, country);
};
```

**Library Used**: `@opendocsg/pdf2md` - Converts PDF to structured Markdown

### 2. Hierarchical Chunking

**File**: `common-service.js` → `processMarkdownToChunks()`

The system uses **heading-based hierarchical chunking** to preserve document structure:

```javascript
exports.processMarkdownToChunks = (markdownContent, country) => {
  const lines = markdownContent.split('\n');
  const chunks = [];
  let currentChunk = null;
  let headingHierarchy = { h1: null, h2: null, h3: null, h4: null };
  
  for (const line of lines) {
    const headingInfo = getHeadingInfo(line);
    
    if (headingInfo) {
      // Finalize previous chunk
      if (currentChunk && currentChunk.content.trim()) {
        chunks.push(currentChunk);
      }
      
      // Update hierarchy
      updateHierarchy(headingInfo.level, headingInfo.text);
      
      // Start new chunk
      currentChunk = {
        heading: headingInfo.text,
        headingLevel: headingInfo.level,
        content: '',
        hierarchy: getCurrentHierarchy(),
        smallestHeadingLevel: headingInfo.level
      };
    } else if (currentChunk && trimmedLine.length > 0) {
      // Append content to current chunk
      currentChunk.content += trimmedLine;
    }
  }
  
  return chunks;
};
```

**Chunk Structure**:
- Each chunk contains content under a heading
- Maintains hierarchical context (h1 → h2 → h3 → h4)
- Preserves document structure for better retrieval

### 3. Chunk Processing in `processFile()`

**File**: `chatbot-service.js` → `processFile()`

```javascript
exports.processFile = async (filePath, filename, country, collection) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.pdf') {
    // Get PDF chunks with hierarchy
    const pdfChunks = await processPdfToChunks(filePath, country);
    
    // Format chunks with metadata
    chunks = pdfChunks.map(item => {
      const allHeadings = [];
      if (item.hierarchy) {
        ['h1', 'h2', 'h3', 'h4'].forEach(level => {
          if (item.hierarchy[level]) {
            allHeadings.push(item.hierarchy[level]);
          }
        });
      }
      
      const headingsText = allHeadings.length > 0 
        ? allHeadings.join('\n') 
        : item.heading;
      let context = `${country} \n ${headingsText}`;
      
      return {
        content: `${context} \n ${item.content}`,
        metadata: {
          filename,
          country,
          heading: item.heading,
          headingLevel: item.headingLevel,
          hierarchy: JSON.stringify(item.hierarchy),
          smallestHeadingLevel: item.smallestHeadingLevel,
          dataType: 'document'
        }
      };
    });
  }
  
  // Extract content for batch processing
  const inputChunks = chunks.map(chunk => chunk?.content);
  
  // Process in batches
  await processItemsInBatches({
    items: inputChunks,
    collectionName: EMBEDDING_MODELS.DOCUMENT_DATA_COLLECTION_NAME,
    fileName: filename,
    metadata: { filename, country },
    batchSize: PDF_BATCH_SIZE,        // Default: 10 chunks per batch
    concurrency: PDF_CONCURRENCY,      // Default: 5 concurrent batches
    sleepDuration: PDF_SLEEP_DURATION, // Default: 1000ms delay
    progressLogInterval: PDF_PROGRESS_LOG_INTERVAL,
    taskName: 'PDF document processing'
  });
};
```

---

## ChromaDB Storage

### 1. Embedding Generation

**File**: `chatbot-common-service.js` → `generateEmbeddingFromOpenAi()`

```javascript
exports.generateEmbeddingFromOpenAi = async (inputChunks) => {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      input: inputChunks,  // Array of text chunks
      model: 'text-embedding-3-large'  // OpenAI embedding model
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.data.map(d => d.embedding);
};
```

**Model**: `text-embedding-3-large` (3072 dimensions)

### 2. Batch Processing

**File**: `chatbot-common-service.js` → `processItemsInBatches()`

The system processes chunks in batches to handle large PDFs efficiently:

```javascript
const processItemsInBatches = async ({
  items,              // Array of text chunks
  collectionName,     // ChromaDB collection name
  fileName,           // Source file name
  metadata,           // Metadata object
  batchSize = 10,     // Chunks per batch
  concurrency = 5,     // Concurrent batches
  sleepDuration = 1000 // Delay between batches
}) => {
  // Split items into batches
  const batches = chunkArray(items, batchSize);
  
  // Process batches with controlled concurrency
  await processBatchesConcurrently({
    batches,
    collectionName,
    fileName,
    metadata,
    concurrency,
    sleepDuration
  });
};
```

### 3. Batch Processing Function

```javascript
const processBatch = async ({ 
  collectionName, 
  fileName,
  batchToProcess,  // Array of text chunks
  metadata
}) => {
  // Step 1: Generate embeddings for batch
  const embeddings = await generateEmbeddingWithRetry({ 
    inputBatch: batchToProcess,
  });
  
  // Step 2: Get ChromaDB collection
  const collection = await getOrCreateCollection({ collectionName });
  
  // Step 3: Create unique IDs for each chunk
  const ids = embeddings.map((_, idx) => 
    `${fileName}_chunk_${startChunkIndex + idx}`
  );
  
  // Step 4: Store in ChromaDB
  await collection.add({
    ids,                                    // Unique chunk IDs
    embeddings: embeddings.map(r => r.embedding),  // Vector embeddings
    documents: embeddings.map(r => r.text),       // Original text
    metadatas: embeddings.map(() => metadata),     // Metadata (filename, country, etc.)
  });
};
```

### 4. ChromaDB Collection Structure

**Collection**: `document_embeddings_openAI`

**Data Structure**:
```javascript
{
  ids: ['document.pdf_chunk_0', 'document.pdf_chunk_1', ...],
  embeddings: [[0.123, -0.456, ...], [...], ...],  // 3072-dim vectors
  documents: ['Country\nHeading\nContent...', ...],
  metadatas: [
    {
      filename: 'document.pdf',
      country: 'USA',
      heading: 'Section Title',
      headingLevel: 2,
      hierarchy: '{"h1":"Main","h2":"Section"}',
      dataType: 'document'
    },
    ...
  ]
}
```

### 5. ChromaDB Connection

**File**: `db/chroma.js`

```javascript
const { ChromaClient } = require('chromadb');
const chromaClient = new ChromaClient({ 
  path: Config?.chromaDb?.connectionURL 
});
```

---

## Query Processing & Retrieval

### 1. User Query Flow

**API Endpoint**: `POST /v1/ai/chat`

**Service**: `chatbot-service.js` → `getChatBotResponse()`

### 2. Intent Classification

```javascript
// Step 1: Classify intent and enhance query
const { intent, enhancedQuery, isQuestionRelevant } = 
  await classifyIntentAndEnhanceQuery(message, conversationHistory, modelUsed);

// Intents: 'greeting', 'general', 'knowledge', 'course-enquiry', 'acknowledgement-search'
```

### 3. Country Extraction

```javascript
// Extract countries from enhanced query
countriesFromQuestion = await extractCountriesFromMessage(enhancedQuery);

// Example: "What are the requirements for USA and Canada?"
// Returns: ['USA', 'Canada']
```

### 4. Vector Search in ChromaDB

**File**: `chatbot-common-service.js` → `searchRelevantTextForInputCountries()`

```javascript
exports.searchRelevantTextForInputCountries = async (
  query,           // User's enhanced query
  countries,       // Extracted countries
  searchOptions,  // Search configuration
  collectionName  // ChromaDB collection name
) => {
  // Step 1: Generate query embedding
  let queryEmbedding = await generateEmbeddingFromOpenAi(query);
  
  // Step 2: Build query parameters
  const queryParams = {
    queryEmbeddings: [queryEmbedding],
    nResults: initialFetchCount,  // Default: 40
  };
  
  // Step 3: Apply country filter
  if (countries && countries.length > 0) {
    if (countries.length === 1) {
      queryParams.where = { country: countries[0] };
    } else {
      queryParams.where = { country: { $in: countries } };
    }
  }
  
  // Step 4: Query ChromaDB
  const results = await collection.query(queryParams);
  
  // Step 5: Filter by distance thresholds
  const allFetchedItems = documents
    .map((doc, i) => ({ 
      document: doc, 
      metadata: metadatas[i], 
      distance: distances[i] 
    }))
    .sort((a, b) => a.distance - b.distance);
  
  // Filter by distance
  const goodMatches = allFetchedItems.filter(
    item => item.distance <= goodDistanceThreshold  // Default: 1.0
  );
  
  const acceptableMatches = allFetchedItems.filter(
    item => item.distance > goodDistanceThreshold && 
            item.distance <= acceptableDistanceThreshold  // Default: 2.0
  );
  
  // Step 6: Combine and limit results
  let finalResults = [...goodMatches];
  if (finalResults.length < minResults) {
    finalResults.push(...acceptableMatches.slice(0, minResults - finalResults.length));
  }
  
  return finalResults.slice(0, maxResults);
};
```

### 5. Reranking (Optional)

**File**: `utils/reranker.js`

The system can optionally rerank results using a cross-encoder model for better relevance:

```javascript
// Apply reranking if enabled
if (rerankingOptions.enableReranking && results.length > 1) {
  return await rerankResults(query, results, rerankingOptions);
}
```

### 6. Context Assembly

```javascript
// Combine retrieved documents
context = relevantTexts.length 
  ? relevantTexts.map(item => item.document).join('\n') 
  : '';

// Also retrieve tabular data and user-answered knowledge
tabularData = await searchRelevantTextForInputCountries(
  enhancedQuery,
  countriesFromQuestion,
  searchOptions,
  EMBEDDING_MODELS.TABULAR_DATA_COLLECTION_NAME
);

userAnsweredKnowledge = await searchRelevantTextForInputCountries(
  enhancedQuery,
  countriesFromQuestion,
  searchOptions,
  EMBEDDING_MODELS.USER_ANSWERED_KNOWLEDGE_COLLECTION_NAME
);
```

### 7. LLM Response Generation

```javascript
// Build system prompt with context
const systemPrompt = generateChatbotSystemPrompt({
  promptToAdd,
  context,              // Retrieved document chunks
  tabularData,         // Retrieved tabular data
  conversationHistory, // Previous conversation
  message,             // Current user message
  enhancedQuery,       // Enhanced query
  userAnsweredKnowledge // User-answered knowledge
});

// Generate response using OpenAI or Gemini
if (process.env.MODEL_TO_USE === 'genAI') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: systemPrompt }] }] });
  assistantReply = result.response.text().trim();
} else {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: systemPrompt }],
    temperature: 0.5,
    max_tokens: 2000
  });
  assistantReply = response.choices[0].message.content.trim();
}
```

---

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

---

## Key Configuration

### Environment Variables

```javascript
// OpenAI Configuration
OPENAI_API_KEY=your_api_key_here

// Model Selection
MODEL_TO_USE=openai  // or 'genAI' for Gemini

// Batch Processing Configuration
CHATBOT_BATCH_SIZE=10           // Chunks per batch
CHATBOT_CONCURRENCY=5           // Concurrent batches
CHATBOT_SLEEP_DURATION=1000     // Delay between batches (ms)
CHATBOT_PROGRESS_INTERVAL=10000 // Progress logging interval (ms)

// ChromaDB Configuration
CHROMA_DB_CONNECTION_URL=http://localhost:8000
```

### Collection Names

```javascript
EMBEDDING_MODELS = {
  DOCUMENT_DATA_COLLECTION_NAME: 'document_embeddings_openAI',
  TABULAR_DATA_COLLECTION_NAME: 'tabular_data_embedding',
  USER_ANSWERED_KNOWLEDGE_COLLECTION_NAME: 'user_answered_knowledge'
}
```

---

## Code Snippets Reference

### 1. Complete PDF Processing Flow

```javascript
// chatbot-service.js - addDocumentToVectorDBAndS3()
exports.addDocumentToVectorDBAndS3 = async (req) => {
  // 1. Upload to S3
  const s3Service = new S3Service(Config.aws);
  let fileName = `ChatBotDocuments/${country}/` + req?.file?.originalname;
  await s3Service.putObjectBuffer(bucket, fileName, fileBuffer);
  
  // 2. Get ChromaDB collection
  const collection = await getOrCreateCollection({ 
    collectionName: EMBEDDING_MODELS.DOCUMENT_DATA_COLLECTION_NAME
  });
  
  // 3. Process file asynchronously
  this.processFile(req.file.path, filename, country, collection);
};
```

### 2. Embedding Generation

```javascript
// chatbot-common-service.js - generateEmbeddingFromOpenAi()
exports.generateEmbeddingFromOpenAi = async (inputChunks) => {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      input: inputChunks,
      model: 'text-embedding-3-large'
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.data.map(d => d.embedding);
};
```

### 3. Vector Search

```javascript
// chatbot-common-service.js - searchRelevantText()
exports.searchRelevantText = async (query, options, countries, collectionName) => {
  // Generate query embedding
  let queryEmbedding = await generateEmbeddingFromOpenAi(query);
  
  // Build query
  const queryParams = {
    queryEmbeddings: [queryEmbedding],
    nResults: initialFetchCount,
    where: countries ? { country: { $in: countries } } : undefined
  };
  
  // Query ChromaDB
  const results = await collection.query(queryParams);
  
  // Filter and return
  return filterResultsByDistance(results, options);
};
```

---

## Summary

The chatbot system follows a **RAG (Retrieval-Augmented Generation)** architecture:

1. **Upload**: PDFs uploaded to S3 and processed asynchronously
2. **Processing**: PDFs converted to Markdown, chunked hierarchically, and embedded using OpenAI
3. **Storage**: Embeddings stored in ChromaDB with metadata (filename, country, headings)
4. **Retrieval**: User queries embedded and searched in ChromaDB using vector similarity
5. **Generation**: Retrieved context combined with LLM to generate accurate responses

The system handles large documents efficiently through batch processing and maintains document structure through hierarchical chunking.

