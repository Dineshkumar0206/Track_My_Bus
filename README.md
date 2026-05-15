# Track My Bus

## Database Setup
Ensure you have MySQL running on `localhost:3306` with username `root` and password `root`.
Run this command in MySQL:
```sql
CREATE DATABASE track_my_bus;
```

## How to run Backend
Navigate to the `backend` folder and run the application:
```bash
cd backend
mvn spring-boot:run
```
The backend API will be available at `http://localhost:8082`.

## How to run Frontend
Simply open the HTML file manually in your web browser:
`frontend/login.html`
There is no need for a Node.js server. The Javascript uses the fetch API with CORS to directly interact with the backend.
