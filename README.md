# Heart Track - Heart Rate Monitoring Application

## Table of Contents
- [Heart Track - Heart Rate Monitoring Application](#heart-track---heart-rate-monitoring-application)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
    - [Key Features:](#key-features)
  - [Team Members](#team-members)
  - [System Requirements](#system-requirements)
  - [Installation Instructions](#installation-instructions)
    - [Prerequisites:](#prerequisites)
    - [Starting the Server:](#starting-the-server)
  - [How to Use](#how-to-use)
  - [APIs and Libraries Used](#apis-and-libraries-used)
  - [Project Structure](#project-structure)
  - [Video Links](#video-links)
  - [Login Credentials](#login-credentials)
    - [User Account:](#user-account)
    - [Physician Account (ECE 513 only):](#physician-account-ece-513-only)
  - [Challenges and Lessons Learned](#challenges-and-lessons-learned)
  - [Team Contributions](#team-contributions)

---

## Project Description
Heart Track is a low-cost IoT-enabled web application for monitoring heart rate and blood oxygen saturation levels. The application supports real-time data transmission from IoT devices, enabling users to monitor their vitals via a responsive web interface on desktops, tablets, and smartphones.

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
- Node.js, Express.js, MongoDB for server-side logic.
- RESTful APIs for communication between IoT devices and the server.
- Third-party libraries for data visualization:
  - Plotting library for charts (e.g., Chart.js).
  - Responsive CSS frameworks (e.g., Bootstrap).

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
