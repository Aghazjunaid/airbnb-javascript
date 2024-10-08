In SQL, indexes are used to improve the speed of data retrieval operations on a database table. They work similarly to an index in a book, allowing the database to find data without scanning every row in a table. Here are the primary types of indexes, along with examples for each:

### 1. **Single-Column Index**

A single-column index is created on a single column of a table.

**Example**:
```sql
CREATE INDEX idx_users_email ON users(email);
```
*Usage*: This index speeds up queries that search for users by email.

### 2. **Composite Index (Multi-Column Index)**

A composite index is created on two or more columns of a table. It can be beneficial for queries that filter on multiple columns.

**Example**:
```sql
CREATE INDEX idx_users_name_email ON users(first_name, last_name);
```
*Usage*: This index is useful for queries that filter by both `first_name` and `last_name`.

### 3. **Unique Index**

A unique index ensures that the values in the indexed column(s) are unique across the table. It is often created on primary keys or columns that must contain unique values.

**Example**:
```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
```
*Usage*: This index ensures that no two users can have the same username.

### 4. **Full-Text Index**

A full-text index is used for efficient retrieval of data based on textual content. It is particularly useful for searching large amounts of text.

**Example** (MySQL):
```sql
CREATE FULLTEXT INDEX idx_posts_content ON posts(content);
```
*Usage*: This index allows for complex search queries on the `content` column of the `posts` table.

### 5. **Bitmap Index**

A bitmap index uses bitmaps and is typically used in data warehousing environments where the cardinality of the data is low, meaning there are few unique values.

**Example** (Oracle):
```sql
CREATE BITMAP INDEX idx_orders_status ON orders(status);
```
*Usage*: This index is useful when querying on the `status` column, which has a limited number of possible values (e.g., "Pending", "Completed", "Cancelled").

### 6. **Clustered Index**

A clustered index determines the physical order of data in a table. A table can have only one clustered index, typically created on the primary key.

**Example**:
```sql
CREATE CLUSTERED INDEX idx_users_id ON users(id);
```
*Usage*: This index physically organizes the table data based on `id`, making retrieval based on `id` very fast.

### 7. **Non-Clustered Index**

A non-clustered index creates a separate structure from the data table that points back to the original table. A table can have multiple non-clustered indexes.

**Example**:
```sql
CREATE NONCLUSTERED INDEX idx_users_lastname ON users(last_name);
```
*Usage*: This index allows for quick lookups based on the `last_name` column without affecting the physical order of the data.

### 8. **Spatial Index**

A spatial index is used for spatial data types, such as points, lines, and polygons. It helps in performing efficient searches on geographic data.

**Example** (PostGIS in PostgreSQL):
```sql
CREATE INDEX idx_locations_geom ON locations USING GIST(geom);
```
*Usage*: This index is useful for spatial queries on the `geom` column in the `locations` table.

### Conclusion

Indexes are crucial for optimizing query performance in SQL databases. Choosing the right type of index depends on the specific use case, the nature of the queries, and the structure of the data. While indexes can significantly speed up data retrieval, they also come with overhead costs for write operations (INSERT, UPDATE, DELETE), so they should be used judiciously.
