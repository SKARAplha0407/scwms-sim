# SanchaarGrid - Smart Campus WiFi Management System

## Overview

The SanchaarGrid (formerly SCWMS) Simulation is a sophisticated web-based environment designed to emulate the operational dynamics of a large-scale campus network. This project serves as a comprehensive testbed for developing and validating network management strategies, traffic classification algorithms, and Quality of Service (QoS) policies without the risks associated with live network intervention.

Built with a modern technology stack featuring Next.js 14, TypeScript, and real-time WebSocket communication, the simulation provides a high-fidelity representation of network telemetry, user behavior, and administrative control planes.

## Key Features

### 1. High-Fidelity Network Simulation
- **Device Telemetry**: Generates realistic, real-time telemetry data for simulated Access Points (APs) and network switches, including bandwidth usage, latency, and packet loss metrics.
- **Traffic Classification**: Simulates deep packet inspection (DPI) capabilities to categorize network traffic into distinct classes such as Academic, Video Streaming, Social Media, and Gaming.
- **User Behavior Modeling**: Emulates diverse user profiles (Student, Faculty, Guest) with varying usage patterns and authentication requirements.

### 2. Intelligent Decision Engine
- **Dynamic Policy Enforcement**: Automatically adjusts network policies based on time of day, academic schedules, and critical events (e.g., "Exam Mode").
- **Automated QoS Optimization**: Prioritizes critical academic traffic during peak hours while throttling non-essential recreational bandwidth.

### 3. Real-Time Analytics Dashboard
- **Live Monitoring**: Features a responsive, data-rich dashboard visualizing network health, active users, and bandwidth distribution in real-time.
- **WebSocket Integration**: Utilizes Pusher Channels to deliver sub-second updates to the administrative interface, ensuring immediate visibility into network state changes.

### 4. Comprehensive Administrative Control
- **Policy Management**: Provides a centralized interface for administrators to manually override policies, simulate network outages, or trigger emergency protocols.
- **Audit Logging**: Maintains an immutable, detailed log of all administrative actions and system events for accountability and post-incident analysis.

## Technical Architecture

The application is architected as a modern, full-stack web application leveraging the following technologies:

- **Frontend Framework**: Next.js 14 (App Router) for server-side rendering and optimized performance.
- **Language**: TypeScript for type-safe, maintainable codebases.
- **Styling**: Tailwind CSS with a custom design system for a premium, responsive user interface.
- **Database**: In-Memory Mock Store (Serverless Ready)
- **Real-Time Communication**: Pusher Channels for scalable WebSocket messaging.
- **Deployment**: Optimized for serverless deployment on Vercel.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- A local or remote MySQL instance
- A Pusher Channels account (for real-time features)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-org/scwms-sim.git
    cd scwms-sim
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory with the following credentials:
    ```env
   # Database Configuration (Mock Mode - No external DB required)
   # MYSQL_* variables are no longer needed
   
   # Pusher Configuration
   PUSHER_APP_ID=your_app_id
   NEXT_PUBLIC_PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
   ```

4.  **Initialize Database**
    The application uses an in-memory mock database. No manual initialization is required. Data will be reset on application restart.

5.  **Launch Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Usage Guide

### Accessing the System
- **Admin Portal**: Navigate to `/admin` to access the main dashboard. Default credentials (for simulation) are configured in the `LoginPage` component.
- **Student/Faculty Portals**: Accessible via `/student` and `/faculty` for user-specific views.

### Running a Simulation
1.  Log in to the **Admin Dashboard**.
2.  The **Simulation Controller** runs automatically in the background, generating telemetry.
3.  Navigate to the **Policy** tab to manually trigger network events like "Exam Mode" to observe system reactions.
4.  Monitor the **Overview** tab to see real-time impact on bandwidth and traffic allocation.

## Deployment

This project is optimized for deployment on the Vercel platform:

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Configure the **Environment Variables** in the Vercel dashboard to match your `.env.local` settings.
4.  Deploy.

---

**Contact**: Shreyas Kumar Rai
**License**: Proprietary / Internal Use Only
