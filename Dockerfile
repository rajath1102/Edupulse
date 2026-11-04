# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
ENV MAVEN_OPTS="-Xms64m -Xmx350m -XX:+UseContainerSupport -XX:+UseSerialGC -XX:CICompilerCount=1 -XX:MaxMetaspaceSize=128m -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
RUN mvn clean package -DskipTests -Dmaven.test.skip=true -B

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/edupulse-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:+UseSerialGC -Xms64m -Xmx320m -XX:MaxMetaspaceSize=128m -Dserver.port=${PORT} -jar app.jar"]
