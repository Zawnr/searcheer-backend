# Searcheer Backend 

Welcome to the official documentation for the Searcheer Backend API. This service is responsible for user authentication, data management (CVs & jobs), and is integrated with a Machine Learning service to provide match analysis and job recommendations.

## ✨ Main Features

- **User Management:** Register, login, view & update profile, and change password.
- **CV Management:** Securely upload CV files (PDF format) to Supabase Storage.
- **Jobs API:** Retrieve a list of jobs from the database with filtering support and get job details by ID.
- **Machine Learning Integration:**
  - Perform synchronized analysis between CV and job descriptions via ML API.
  - Persist analysis results in the database.
  - Receive alternative job recommendations based on the analysis results.
- **Analysis History:** Users can review all previous analysis results.
- **Interactive API Documentation:** Automatically generated using Swagger UI for easy testing and development.
- **Security & Validation:** Validate incoming requests using Joi and configure CORS.
- **Database Optimization:** Use *indexing* on key columns for fast query performance.


## 🛠️ Technologies Used

- **Backend:** Node.js, Hapi.js  
- **Database & Storage:** Supabase (PostgreSQL, Supabase Storage)  
- **Authentication:** JSON Web Tokens (@hapi/jwt)  
- **HTTP Client:** Axios  
- **Validation:** Joi  
- **Documentation:** hapi-swagger  

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18.x or newer)  
- npm (usually comes with Node.js)  
- [Python](https://www.python.org/) (to run the ML server)   
- Machine Learning service repository cloned and set up according to its instructions  


### ⚙️ Installation & Configuration

1. **Clone this repository:**
    ```bash
    git clone https://github.com/Zawnr/searcheer-backend.git
    cd searcheer-backend
    ```

2. **Install all dependencies:**
    ```bash
    npm install
    ```

3. **Configure Environment Variables:**  
    Create a `.env` file in the root directory by copying from the example file and filling in all required values.
    ```bash
    cp .env.example .env
    ```

    **Example `.env` file:**
    ```env
    # Server Configuration
    PORT=3000
    HOST=localhost

    # Frontend URL (for CORS in production)
    FRONTEND_URL=http://localhost:3001
    
    # JWT Secret Key
    JWT_SECRET=replace_with_a_very_long_random_secret_key

    # Supabase Credentials
    SUPABASE_URL=https://sdpccyzdkogsfjxtkbrs.supabase.co
    SUPABASE_SERVICE_KEY= ask zawawi for this one!

    # Machine Learning API URL
    ML_API_BASE_URL=http://localhost:8000
    ```

---

### ▶️ Running the Application

To enable the analysis feature, **both the Backend and the ML server must be running simultaneously** in separate terminals.

1. **Start the Backend Service (Hapi.js):**
    ```bash
    npm run dev
    ```

2. **Start the Machine Learning Service (Python/FastAPI):**  
    (Open a new terminal in your ML project directory)
    ```bash
    python api.py
    ```

The backend server will run at: `http://localhost:3000`

## 📚 API Documentation

Once the server is running, interactive API documentation is available via Swagger UI at:

**[http://localhost:3000/documentation](http://localhost:3000/documentation)**

You can view all available endpoints, data models, and even test the API directly from this page. For protected endpoints, use the "Authorize" button after obtaining a token from the login endpoint.

---

## How to Use the Interactive Documentation (Swagger UI)

This interactive API documentation allows you not only to read about each endpoint, but also to test them directly from your browser. It's accessible when the server is running at:

`http://<SERVER_URL>/documentation` (e.g., `http://localhost:3000/documentation`)

### Step 1: Explore Endpoints

The documentation groups all endpoints by their functionality (e.g., **Users**, **Jobs**, **Analysis**).

1. Click on a group to see the list of available endpoints.
2. Click on an endpoint row (e.g., `POST /users/login`) to view its full details.
3. You'll find:
   * A brief description of the endpoint.
   * Required parameters (if any).
   * Example request body format.
   * Possible responses (success or error).

### Step 2: Test Public Endpoints (No Login Required)

Public endpoints are marked with an open lock icon (🔓) or no icon.

1. Open a public endpoint like `GET /jobs`.
2. Click the **"Try it out"** button in the top-right of that section. This will enable the input form.
3. For `GET /jobs`, you can simply click the blue **"Execute"** button to fetch all job listings. Optional filters can also be applied.
4. Scroll down to the **"Server response"** section to see the live response from your server.

### Step 3: Test Protected Endpoints (Login Required)

Protected endpoints are marked with a closed lock icon (🔒). You need to "log in" within Swagger to test them.

**A. Obtain Your Token**
* Use the public endpoint `POST /users/login` (like in Step 2) with a valid email and password.
* From the successful response, **copy the `token`** value.

**B. Authorize in Swagger**
* Click the green **"Authorize"** button in the top-right corner.
* A dialog will appear. In the `bearerAuth` section, paste your token with the prefix `Bearer`.
    * Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
* Click **"Authorize"**, then **"Close"**.

**C. Run Protected Endpoints**
* Now, all locked endpoints will be unlocked for your session.
* Open any protected endpoint, like `GET /users/me`.
* Click **"Try it out"** and then **"Execute"**.
* Swagger will automatically include the `Authorization` header in the request, and you'll receive a valid response.

These three steps allow you to fully test and explore your API directly from the browser.


## 🧾 Endpoints List

| Method | Endpoint                                       | Description                                          | Auth Required? |
|--------|------------------------------------------------|------------------------------------------------------|----------------|
| `POST` | `/users/register`                              | Register a new user.                                | No             |
| `POST` | `/users/login`                                 | Login and get a JWT token.                          | No             |
| `GET`  | `/users/me`                                    | Get the profile of the currently logged-in user.    | **Yes** (JWT)  |
| `PATCH`| `/users/me`                                    | Update profile (username).                          | **Yes** (JWT)  |
| `PUT`  | `/users/me/password`                           | Change user password.                               | **Yes** (JWT)  |
| `POST` | `/cvs`                                         | Upload a CV file (PDF).                             | **Yes** (JWT)  |
| `POST` | `/cvs/{cvId}/analyze`                          | Start analyzing a CV against a job description.     | **Yes** (JWT)  |
| `GET`  | `/cvs/{cvId}/analysis-results`                 | View all analysis results for a given CV.           | **Yes** (JWT)  |
| `GET`  | `/analysis-results/{id}`                       | View details of a specific analysis result.         | **Yes** (JWT)  |
| `GET`  | `/analysis-results/{id}/recommendations`       | Get job recommendations based on analysis result.   | **Yes** (JWT)  |
| `GET`  | `/jobs`                                        | Get a list of available jobs (supports filtering).  | No             |
| `GET`  | `/jobs/{id}`                                   | Get job details by ID.                              | No             |



