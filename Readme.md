<!-- Build Task Management API: Users, Projects, Tasks CRUD endpoints. Implement Joi validation for all inputs. Add pagination, sorting, filtering, error handling. -->

<!-- Features Listing
- Users Authentications
- Projects Listings
- CRUD Operations to Add Different Projects
- JOI Validations
- Paginations
- Sorting
- Filtering
- Error Handling
-->





<!-- DB Design

{
    "users": {
        "user_001": {
            "id": "Taking_Time",
            "username": "NitinSemwal",
            "email": "nitinsemwal@todo.com",
            "password" : "Encrypted Using JWT (hashedPassword)"
        };
    };

    "projects": {
        "project_001": {
            "project_id": "project_001",
            "owner_id" : "user_001",
            "project": "Building SAAS Project",
            "description" : "Building a SAAS for Medtech Audience."
        };
    };

    "tasks": {
        "tasks_001": {
            "project_id": "project_001",
            "user_id" : "user_001", // Doubt of Existance
            "tasks_id" : "task_001",
            "tasks_description": "Complete the MVP for Product.",
            "tasks_status" : "false"
        };
    };
}

- Create a Map with the data as {project : tasks} (where project is linked with the Users);
- With this Database Will take less time to Get Data.


- Validation
    - Server Side (Username,Email,Password, Projectname , Description Length)

- Paginations
    - Pagination on the Top Level for Showing Users (5 Users Per Shift)

-Sorting
    - User with More Projects will be on Top of Lists.

- Filtering
    - To Mark as Done.

-->"# TaskManagement-Backend" 
"# TaskManagement-PostgreSQL" 
