Here's a structured approach to building an application to manage E-Commerce Fashion categories in a tree structure, using Node.js for the backend and React for the frontend. 

### Backend (Node.js with Express)

#### Step 1: Set Up the Project

1. **Initialize the Project**:
   ```bash
   mkdir ecommerce-categories
   cd ecommerce-categories
   npm init -y
   npm install express mongoose body-parser
   ```

2. **Create the Directory Structure**:
   ```bash
   mkdir models routes controllers tests
   ```

#### Step 2: Create the Category Model

**models/Category.js**

```javascript
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
});

module.exports = mongoose.model('Category', categorySchema);
```

#### Step 3: Create the Category Controller

**controllers/categoryController.js**

```javascript
const Category = require('../models/Category');

// Get all categories in a tree structure
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        const categoryTree = buildCategoryTree(categories);
        res.json(categoryTree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to build category tree
const buildCategoryTree = (categories, parentId = null) => {
    return categories
        .filter(category => category.parentId == parentId)
        .map(category => ({
            ...category._doc,
            children: buildCategoryTree(categories, category._id),
        }));
};

// Create a new category
exports.createCategory = async (req, res) => {
    const { name, parentId } = req.body;
    const category = new Category({ name, parentId });

    try {
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, parentId } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, parentId },
            { new: true }
        );
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        await Category.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
```

#### Step 4: Create the Routes

**routes/categoryRoutes.js**

```javascript
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
```

#### Step 5: Set Up the Express Server

**server.js**

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Routes
app.use('/api/categories', categoryRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

#### Step 6: Unit Tests

**tests/categoryController.test.js**

```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Expose app in server.js
const Category = require('../models/Category');

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/ecommerce_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Category API', () => {
    it('should create a new category', async () => {
        const response = await request(app)
            .post('/api/categories')
            .send({ name: 'Women', parentId: null });
        
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Women');
    });

    it('should get categories in tree structure', async () => {
        const response = await request(app).get('/api/categories');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update a category', async () => {
        const category = await Category.create({ name: 'Men', parentId: null });
        const response = await request(app)
            .put(`/api/categories/${category._id}`)
            .send({ name: 'Men\'s Fashion' });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Men\'s Fashion');
    });

    it('should delete a category', async () => {
        const category = await Category.create({ name: 'Footwear', parentId: null });
        const response = await request(app).delete(`/api/categories/${category._id}`);
        
        expect(response.status).toBe(204);
    });
});
```

### Frontend (React)

#### Step 1: Set Up the React Project

1. **Initialize the Project**:
   ```bash
   npx create-react-app ecommerce-frontend
   cd ecommerce-frontend
   npm install axios
   ```

#### Step 2: Create Components

**src/components/CategoryTree.js**

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryTree = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        };
        fetchCategories();
    }, []);

    const renderTree = (nodes) => {
        return (
            <ul>
                {nodes.map(node => (
                    <li key={node._id}>
                        {node.name}
                        {node.children && node.children.length > 0 ? renderTree(node.children) : null}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <h1>Category Tree</h1>
            {renderTree(categories)}
        </div>
    );
};

export default CategoryTree;
```

#### Step 3: Use the Component in App

**src/App.js**

```javascript
import React from 'react';
import './App.css';
import CategoryTree from './components/CategoryTree';

function App() {
    return (
        <div className="App">
            <CategoryTree />
        </div>
    );
}

export default App;
```

### Final Steps

1. **Run the Backend**:
   ```bash
   node server.js
   ```

2. **Run the Frontend**:
   ```bash
   npm start
   ```

### Summary

- **Backend**: We built a RESTful API to manage categories with endpoints for creating, updating, deleting, and retrieving categories in a tree structure.
- **Frontend**: A React component fetches and displays the categories in a hierarchical format.
- **Testing**: Unit tests cover the primary functionalities of the API.

This setup provides a robust foundation for managing e-commerce categories, ensuring scalability and maintainability while following best practices in coding and architecture.


To enhance the React component so that clicking on a category opens its children, we can implement a toggle functionality. Additionally, I’ll provide some basic CSS to style the category tree.

### Updated React Component

Here’s the modified `CategoryTree.js` with the toggle functionality:

**src/components/CategoryTree.js**

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CategoryTree.css'; // Import CSS

const CategoryTree = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        };
        fetchCategories();
    }, []);

    const toggleChildren = (category) => {
        category.showChildren = !category.showChildren;
        setCategories([...categories]);
    };

    const renderTree = (nodes) => {
        return (
            <ul>
                {nodes.map(node => (
                    <li key={node._id}>
                        <span className="category-name" onClick={() => toggleChildren(node)}>
                            {node.name}
                        </span>
                        {node.showChildren && node.children && node.children.length > 0 ? renderTree(node.children) : null}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="category-tree">
            <h1>Category Tree</h1>
            {renderTree(categories)}
        </div>
    );
};

export default CategoryTree;
```

### CSS Styles

Create a CSS file named `CategoryTree.css` in the same folder as `CategoryTree.js` and add the following styles:

**src/components/CategoryTree.css**

```css
.category-tree {
    font-family: Arial, sans-serif;
    margin: 20px;
}

.category-tree h1 {
    font-size: 24px;
    color: #333;
}

.category-tree ul {
    list-style-type: none; /* Remove bullets */
    padding-left: 20px; /* Indent child lists */
}

.category-tree li {
    margin: 5px 0; /* Space between categories */
}

.category-name {
    cursor: pointer; /* Pointer cursor for clickable categories */
    color: #007BFF; /* Bootstrap primary color */
    transition: color 0.3s;
}

.category-name:hover {
    color: #0056b3; /* Darker shade on hover */
}

.category-name:after {
    content: ' ▼'; /* Arrow for expandable categories */
}

.category-name:only-child:after {
    content: ''; /* Remove arrow if no children */
}

.category-name.show-children:after {
    content: ' ▲'; /* Arrow for collapsible categories */
}
```

### Explanation of Changes

1. **Toggle Functionality**:
   - A `toggleChildren` function is added to toggle the visibility of the children for a category when clicked.
   - A new property `showChildren` is used to track whether the children should be displayed.

2. **CSS Styles**:
   - Basic styles are applied to improve the layout and aesthetics of the category tree.
   - The categories are styled to look clickable, with hover effects and arrows indicating whether they can be expanded or collapsed.

### Final Steps

1. **Run the Application**:
   Ensure your backend is running, then start your React application:
   ```bash
   npm start
   ```

2. **Test the Functionality**:
   Click on the category names to expand and collapse their children.

### Summary

The updated code allows users to interact with the category tree by clicking on category names to show or hide their children, and the CSS enhances the visual presentation of the tree structure, making it more user-friendly.
