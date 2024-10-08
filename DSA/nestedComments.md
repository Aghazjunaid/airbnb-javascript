To store nested comments up to an infinite level and then fetch and display them in a nested structure, you can modify the table structure slightly and include logic to retrieve and format the comments appropriately. Here's an example of how you can achieve this using MySQL and Node.js:

### Table Structure:

```sql
CREATE TABLE blog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT
);

CREATE TABLE comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    parent_id INT,
    commenter_name VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES blog(id),
    FOREIGN KEY (parent_id) REFERENCES comment(id)
);
```

### Insert API in Node.js:

Here is an example of the API endpoint to insert a comment:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yourusername',
    password: 'yourpassword',
    database: 'yourdatabase'
});

app.post('/comments', (req, res) => {
    const { post_id, parent_id, commenter_name, comment_text } = req.body;

    const query = `INSERT INTO comment (post_id, parent_id, commenter_name, comment_text) 
                   VALUES (?, ?, ?, ?)`;

    connection.query(query, [post_id, parent_id, commenter_name, comment_text], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'Error inserting comment' });
        } else {
            res.status(200).json({ message: 'Comment inserted successfully' });
        }
    });
});

// Get nested comments for a post
function formatComments(comments, parentId = null) {
    const result = comments.filter(comment => comment.parent === parentId)
    .map(comment => ({
        ...comment,
        replies: formatComments(comments, comment.id)
    }));
    return result.length > 0 ? result : null;
}

app.get('/comments/:post_id', (req, res) => {
    const postId = req.params.post_id;

    const comments = const arr =[{
                          id:1,
                          post_id: 2,
                          parent: null,
                        },
                        {
                          id:2,
                          post_id: 2,
                          parent: 1,
                        },
                        {
                          id:3,
                          post_id: 2,
                          parent: 2,
                        },
                        {
                          id:4,
                          post_id: 2,
                          parent: null,
                        },
                        {
                          id:5,
                          post_id: 2,
                          parent: 3,
                        }
                        ,{
                          id:6,
                          post_id: 2,
                          parent: 3,
                        }]

    const nestedComments = formatComments(comments);

    res.json(nestedComments);
//
[
  {
    "id": 1,
    "post_id": 2,
    "parent": null,
    "replies": [
      {
        "id": 2,
        "post_id": 2,
        "parent": 1,
        "replies": [
          {
            "id": 3,
            "post_id": 2,
            "parent": 2,
            "replies": [
              {
                "id": 5,
                "post_id": 2,
                "parent": 3,
                "replies": null
              },
              {
                "id": 6,
                "post_id": 2,
                "parent": 3,
                "replies": null
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "post_id": 2,
    "parent": null,
    "replies": null
  }
]
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```

In the above Node.js code, we have provided an example of how to insert comments and fetch nested comments for a post using the provided array of comments. The `formatComments` function recursively formats the comments into a nested structure based on the parent-child relationships specified in the `parent` field.

//Frontend Code
```javascript
import React from 'react';
import './NestedComments.css';

const Comment = ({ comment }) => {
  return (
    <div className="comment">
      <h2 className="comment-id">Comment ID: {comment.id}</h2>
      <p className="post-id">Post ID: {comment.post_id}</p>
      {comment.replies && comment.replies.map(reply => (
        <div className="reply">
          <Comment key={reply.id} comment={reply} />
        </div>
      ))}
    </div>
  );
};

const NestedComments = () => {
  const comments = [{"id":1,"post_id":2,"parent":null,"replies":[{"id":2,"post_id":2,"parent":1,"replies":[{"id":3,"post_id":2,"parent":2,"replies":[{"id":5,"post_id":2,"parent":3,"replies":null},{"id":6,"post_id":2,"parent":3,"replies":null}]}]}]},{"id":4,"post_id":2,"parent":null,"replies":null}];

  return (
    <div className="comments-container">
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default NestedComments;
```
