# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build the JAR
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /app

# Copy dependency manifests first to leverage layer caching
COPY pom.xml .

# Install Maven inside the image (no wrapper available)
RUN apk add --no-cache maven

# Pre-download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy sources and build
COPY src ./src
RUN mvn package -B -DskipTests

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Minimal runtime image
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]
