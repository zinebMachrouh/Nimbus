# Nimbus School Bus Tracking System

Nimbus is a comprehensive school bus tracking and management system that provides real-time monitoring, attendance tracking, and communication features for schools, parents, and bus drivers.

## Features

### For Parents
- Real-time bus location tracking
- Student attendance monitoring
- Push notifications for bus arrival/departure
- Absence reporting and management
- Route information and schedules

### For Drivers
- Real-time navigation assistance
- Student attendance management
- Emergency alerts and notifications
- Route optimization
- Vehicle status monitoring

### For Administrators
- User management (parents, drivers, students)
- Route management and optimization
- Bus fleet management
- Attendance reports and analytics
- System configuration and monitoring

## Technology Stack

### Backend
- Spring Boot 3.x
- PostgreSQL 16
- Redis 7
- JWT Authentication
- WebSocket for real-time updates
- MapStruct for object mapping
- Swagger/OpenAPI for documentation

### Frontend (Coming Soon)
- Angular 17
- TypeScript
- Material Design
- Leaflet for maps
- Chart.js for analytics

## Prerequisites

- Java 17 or later
- Node.js 18 or later
- Docker and Docker Compose
- Maven 3.8 or later

## Getting Started

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nimbus.git
cd nimbus/back-end
```

2. Start the required services using Docker Compose:
```bash
docker-compose up -d
```

3. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The application will be available at `http://localhost:8080/api`

### API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api/api-docs`

## Project Structure

```
back-end/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── nimbus/
│   │   │           ├── config/         # Configuration classes
│   │   │           ├── controller/     # REST controllers
│   │   │           ├── dto/            # Data Transfer Objects
│   │   │           ├── entity/         # JPA entities
│   │   │           ├── exception/      # Custom exceptions
│   │   │           ├── handler/        # WebSocket handlers
│   │   │           ├── mapper/         # MapStruct mappers
│   │   │           ├── repository/     # JPA repositories
│   │   │           ├── service/        # Business logic
│   │   │           └── util/           # Utility classes
│   │   └── resources/
│   │       └── application.yml         # Application properties
│   └── test/                          # Test classes
├── docker-compose.yml                  # Docker Compose configuration
├── pom.xml                            # Maven dependencies
└── README.md                          # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@nimbus.com or create an issue in the repository. 