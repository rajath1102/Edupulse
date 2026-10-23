# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
ENV MAVEN_OPTS="-Xms64m -Xmx320m -XX:+UseContainerSupport -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
RUN mvn clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/edupulse-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -Xms64m -Xmx320m -Dserver.port=${PORT} -jar app.jar"]
