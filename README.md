# Heart Track - Heart Rate Monitoring Application

## Table of Contents
- [Project Description](#project-description)
  - [Key Features](#key-features)
- [Team Members](#team-members)
- [System Requirements](#system-requirements)
- [Installation Instructions](#installation-instructions)
  - [Prerequisites](#prerequisites)
  - [Starting the Server](#starting-the-server)
- [How to Use](#how-to-use)
- [APIs and Libraries Used](#apis-and-libraries-used)
- [Project Structure](#project-structure)
- [Video Links](#video-links)
- [Login Credentials](#login-credentials)
  - [User Account](#user-account)
  - [Physician Account (ECE 513 only)](#physician-account-ece-513-only)
- [Challenges and Lessons Learned](#challenges-and-lessons-learned)
- [Team Contributions](#team-contributions)

---

## Project Description

Heart Track is a low-cost IoT-enabled web application for real-time monitoring of heart rate and blood oxygen saturation levels. The application integrates with IoT devices to allow users to track their vitals conveniently via a web interface, which is responsive across desktops, tablets, and smartphones.

### Key Features:
- **Account Creation and Management**: Users can create an account and securely manage their profile.
- **IoT Device Integration**: Seamless connection with IoT devices for heart rate and blood oxygen measurement.
- **Configurable Measurement Schedules**: Customize measurement intervals and times of day for data collection.
- **Data Visualization**: Visual summaries of daily and weekly vitals data.
- **Token-based Authentication**: Secure access with token authentication for both users and physicians.

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
- Node.js, Express, MongoDB for backend server implementation
- JavaScript libraries for front-end: Chart.js, Bootstrap, etc.

---

## Installation Instructions

### Prerequisites:
1. Install **Node.js** and **MongoDB**.
2. Clone the project repository:
   ```bash
   git clone https://github.com/your-repo/heart-track.git
   cd heart-track
