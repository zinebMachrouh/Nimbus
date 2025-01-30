FROM maven:3-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21 AS run

WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8085

CMD ["java", "-jar", "app.jar"]
