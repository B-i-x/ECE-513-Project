# Heart Track - Heart Rate Monitoring Application

## Table of Contents
- [Heart Track - Heart Rate Monitoring Application](#heart-track---heart-rate-monitoring-application)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
    - [Key Features:](#key-features)
  - [Technologies Used](#technologies-used)
  - [Project Structure](#project-structure)
  - [Team Members](#team-members)
  - [System Requirements](#system-requirements)
  - [Installation Instructions](#installation-instructions)
    - [Prerequisites:](#prerequisites)
    - [Starting the Server:](#starting-the-server)
  - [How to Use](#how-to-use)
  - [APIs and Libraries Used](#apis-and-libraries-used)
    - [Overview](#overview)
    - [Setup and Installation](#setup-and-installation)
    - [API Endpoints](#api-endpoints)
    - [Devices](#devices)
      - [POST `/devices/register`](#post-devicesregister)
      - [POST `/devices/data`](#post-devicesdata)
      - [GET `/devices/timing-data`](#get-devicestiming-data)
    - [Users](#users)
      - [POST `/users/register`](#post-usersregister)
      - [POST `/users/login`](#post-userslogin)
      - [PUT `/users/update-password`](#put-usersupdate-password)
      - [DELETE `/users/remove-device`](#delete-usersremove-device)
      - [GET `/users/data`](#get-usersdata)
    - [Notes](#notes)
  - [Project Structure](#project-structure-1)
  - [Video Links](#video-links)
  - [Login Credentials](#login-credentials)
    - [User Account:](#user-account)
    - [Physician Account (ECE 513 only):](#physician-account-ece-513-only)
  - [Challenges and Lessons Learned](#challenges-and-lessons-learned)
  - [Team Contributions](#team-contributions)

---

## Project Description
Heart Track is a low-cost IoT-enabled web application for monitoring heart rate and blood oxygen saturation levels. The application supports real-time data transmission from IoT devices, enabling users to monitor their vitals via a responsive web interface on desktops, tablets, and smartphones.

[Link to website](https://ec2-54-151-120-233.us-west-1.compute.amazonaws.com:3001/)


### Key Features:
- Account creation and management.
- IoT device integration to monitor heart rate and blood oxygen levels.
- Configurable measurement schedules.
- Data visualization for daily and weekly summaries.
- Token-based authentication for secure access.

## Technologies Used

- **Node.js**: Server-side JavaScript execution.
- **Express**: Web framework for building the REST API.
- **MongoDB (Mongoose)**: Database management system and ODM for handling user, device, and measurement data.
- **JWT (JSON Web Tokens)**: Authentication mechanism for securing user login and device interactions.
- **bcrypt**: Secure password hashing for user registration and login.
- **AJAX (jQuery)**: For making asynchronous requests from the front-end to the server.

## Project Structure

- `models/`: Contains Mongoose schemas for the application (User, Device, Measurement).
- `routes/`: Contains Express route handlers for managing user and device operations.
- `public/`: Front-end assets, including HTML files and JavaScript.
- `app.js`: Main server file that initializes Express, connects to MongoDB, and sets up routes.
- `db.js`: Handles MongoDB database connection.

---

## Team Members
- **Team Name**: 
- **Members**:
  - Alex Romero
  - Mason Marrero
  - Dasol Ahn

---

## System Requirements
- IoT Development Board (Photon or Argon)
- Heart Rate Sensor (MAX30102 Pulse Detection Blood Oxygen)
- Node.js, Express, MongoDB for server implementation
- Third-party JavaScript and CSS libraries for front-end design

---

## Installation Instructions
### Prerequisites:
1. Install Node.js and MongoDB.
2. Clone the project repository:
   git clone https://github.com/your-repo/heart-track.git
   cd heart-track

### Starting the Server:
1. Run MongoDB.
2. Start the server:
   npm start

3. Access the web application at http://localhost:3000.

---

## How to Use
1. Create an account using your email and a secure password.
2. Register your IoT device to start monitoring heart rate and oxygen levels.
3. Use the web interface to view daily and weekly summaries.
4. Configure the measurement frequency and time-of-day ranges from the settings menu.

---

## APIs and Libraries Used
### Overview
This API provides the backend functionality for managing user authentication, device registration, and data recording in a health tracking system. The project includes the following key files:

- `devices.js`: Manages device registration and data entry for health metrics.
- `index.js`: Configures the root route of the API.
- `users.js`: Manages user authentication and profile functionalities.

### Setup and Installation
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Configure a `.env` file with the following variables:
   - `JWT_SECRET`: Secret key for token generation.
   - Any other required environment variables.
4. Start the server with `npm start` or `node app.js`.

### API Endpoints
---
### Devices

#### POST `/devices/register`
Registers a new device.

- **Headers**: 
  - `apikey`: (Required) API key for authentication.
- **Body**: 
  ```json
  {
    "deviceId": "string"
  }
  ```
- **Responses**:
  - `201`: Device registered successfully.
  - `400`: Missing required fields.
  - `409`: Device already registered.
  - `500`: Server error.

#### POST `/devices/data`
Records health metrics for a registered device.

- **Body**:
  ```json
  {
    "bpm": "number",
    "bOx": "number",
    "deviceId": "string"
  }
  ```
- **Responses**:
  - `201`: Measurement added successfully.
  - `400`: Missing or invalid fields.
  - `404`: Device not found.
  - `500`: Server error.

#### GET `/devices/timing-data`
Retrieves timing data for a device.

- **Query Parameters**:
  - `deviceId`: (Required) ID of the device.
- **Headers**:
  - `Authorization`: Bearer token.
- **Responses**:
  - `200`: Returns timing schedule.
  - `400`: Missing or invalid parameters.
  - `404`: Device not found.
  - `500`: Server error.

### Users

#### POST `/users/register`
Registers a new user.

- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `201`: User registered successfully.
  - `400`: Missing required fields.
  - `500`: Server error.

#### POST `/users/login`
Logs in an existing user.

- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200`: Login successful, returns a token.
  - `400`: Missing required fields.
  - `401`: Invalid email or password.
  - `500`: Server error.

#### PUT `/users/update-password`
Updates a user’s password.

- **Headers**:
  - `Authorization`: Bearer token.
- **Body**:
  ```json
  {
    "newPassword": "string"
  }
  ```
- **Responses**:
  - `200`: Password updated successfully.
  - `400`: Missing required fields.
  - `404`: User not found.
  - `500`: Server error.

#### DELETE `/users/remove-device`
Removes a device associated with a user.

- **Headers**:
  - `Authorization`: Bearer token.
- **Body**:
  ```json
  {
    "deviceId": "string"
  }
  ```
- **Responses**:
  - `200`: Device removed successfully.
  - `400`: Missing required fields.
  - `404`: Device not found or not associated with the user.
  - `500`: Server error.

#### GET `/users/data`
Fetches health data for a device.

- **Query Parameters**:
  - `deviceId`: (Required) ID of the device.
  - `limit`: (Optional) Number of records to return (-1 for all records).
- **Responses**:
  - `200`: Returns device data.
  - `400`: Missing or invalid parameters.
  - `404`: Device not found.
  - `500`: Server error.

### Notes

- Ensure `JWT_SECRET` is securely stored and never exposed in the code.
- Follow proper error handling practices for a robust API.


---

## Project Structure
    root/
    ├── public/
    │   ├── css/
    │   ├── js/
    │   ├── index.html
    │   ├── reference.html
    ├── routes/
    │   ├── api.js
    │   ├── user.js
    ├── models/
    │   ├── User.js
    │   ├── Device.js
    ├── server.js
    ├── README.md
    ├── package.json

---

## Video Links
- [Pitch Video]()
- [Demo Video]()

---

## Login Credentials
### User Account:
- **Email**: 
- **Password**: 

### Physician Account (ECE 513 only):
- **Email**:
- **Password**: 

---

## Challenges and Lessons Learned
- **Challenges**:
  1. 
  2. 
  3. 

- **Lessons Learned**:
  1. 
  2. 
  3. 

---

## Team Contributions
| Team Member  | Frontend (%) | Backend (%) | Embedded (%) | Documentation (%) | Demos (%) |
|-------------------|--------------|-------------|--------------|-------------------|-----------|
| Alex Romero  | 0 | 0 | 0 | 0 | 0 |
| Mason Marrero| 0 | 0 | 0 | 0 | 0 |
| Dasol Ahn    | 0 | 0 | 0 | 0 | 0 |

---
