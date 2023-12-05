## Provider Consumer Platform

The Provider Consumer Platform is a TypeScript application that facilitates service providers in selling their services and enables consumers to make purchases. The app embraces MVC, DTO, DDD, and DI principles to ensure efficient module dependencies and maintainability. It incorporates the Singleton pattern for reusable database connections, Redis for caching certain endpoints and sessions to enhance scalability, and Winston Logger for comprehensive logging. Prometheus is used to monitor metrics for system health and performance.

## Overview

- **Modular Architecture:** The app follows the MVC (Model-View-Controller), DTO (Data Transfer Object), DDD (Domain-Driven Design), and DI (Dependency Injection) principles to ensure a modular and maintainable codebase.

- **Singleton Pattern:** The Singleton pattern is employed to manage the database connection for reusability across the application.

- **Redis for Caching:** Redis is utilized to cache certain endpoints and sessions, enhancing the scalability and responsiveness of the platform.

- **Winston Logger:** The application integrates the Winston Logger for efficient and comprehensive logging, aiding in debugging and monitoring.

- **Prometheus Monitoring:** Prometheus is used to monitor metrics for system health and performance, ensuring a robust and efficient system.

- **JWT Authorization/Authentication:** JWT is employed for secure authorization and authentication, ensuring a secure and seamless user experience.

- **Stripe Integration:** The platform integrates with Stripe for payment processing, providing a reliable and secure payment gateway.

- **Common Middleware:** An app named 'common' is published for injecting reusable middleware and other components into the main app, promoting code reusability.

## Project Structure
```plaintext
/provider_consumer_platform
|-- app
|-- common
|-- docker-compose.yml
|-- %home%m%nodeprj%provider_consumer_platform.vim
|-- package-lock.json
```

## Getting Started
1. Explore the main app and the 'common' app for modular functionalities.
2. Run the Docker Compose configuration using `docker-compose up`.
3. Test the various features of the Provider Consumer Platform.

Feel free to contribute, report issues, or provide feedback. Let's collaborate to enhance and optimize the Provider Consumer Platform!
