# Step 1: Build the application using Maven
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the entire source code and build the production JAR file
COPY src ./src
RUN mvn package -DskipTests

# Step 2: Run the application using a slim Java Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the compiled JAR file from the build step
COPY --from=build /app/target/*.jar app.jar

# Run as an unprivileged user (uid 10001). The deploy script gives this uid ownership of the
# mounted uploads folder so the app can still write to it.
RUN useradd --system --uid 10001 --no-create-home appuser \
    && mkdir -p /app/uploads && chown -R appuser /app
USER appuser

# Expose the internal port your Spring Boot app runs on (usually 8080)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]