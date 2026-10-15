package com.edupulse;

import com.edupulse.dto.LoginRequestDTO;
import com.edupulse.dto.RegisterRequestDTO;
import com.edupulse.model.Role;
import com.edupulse.model.Student;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAndAuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testUnauthenticatedAccessReturnsUnauthorized() throws Exception {
        // Accessing protected endpoints without token must return 401
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void testDemoAdminLoginAndSuccess() throws Exception {
        LoginRequestDTO login = new LoginRequestDTO("admin", "admin123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = root.get("token").asText();
        assertNotNull(token);

        // Access protected student endpoint with token
        mockMvc.perform(get("/api/students")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testLoginWithBadCredentialsReturnsUnauthorized() throws Exception {
        LoginRequestDTO login = new LoginRequestDTO("admin", "wrong_password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testStudentRegistrationAndRoleRestrictions() throws Exception {
        // 1. Register a new student
        String uniqueUsername = "alice_" + System.currentTimeMillis();
        String uniqueEmail = uniqueUsername + "@example.com";
        RegisterRequestDTO reg = new RegisterRequestDTO(uniqueUsername, uniqueEmail, "secret123", Role.ROLE_STUDENT);
        reg.setName("Alice Wonderland");
        reg.setCourse("Data Science");
        reg.setYear(2);

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"))
                .andReturn();

        JsonNode root = objectMapper.readTree(regResult.getResponse().getContentAsString());
        String studentToken = root.get("token").asText();

        // 2. Student can query /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(uniqueUsername))
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"));

        // 3. Student can read /api/students
        mockMvc.perform(get("/api/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // 4. Student CANNOT create new students (POST /api/students requires TEACHER or ADMIN)
        Student newStudent = new Student("Hacker", "hacker@test.com", "CS", 1);
        mockMvc.perform(post("/api/students")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newStudent)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testTeacherCanCreateStudent() throws Exception {
        // Login as demo teacher
        LoginRequestDTO teacherLogin = new LoginRequestDTO("teacher", "teacher123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(teacherLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String teacherToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();

        // Teacher CAN create new student
        String studentEmail = "new_student_" + System.currentTimeMillis() + "@example.com";
        Student student = new Student("Bob Ross", studentEmail, "Art Engineering", 1);

        mockMvc.perform(post("/api/students")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(student)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Bob Ross"));
    }
}
